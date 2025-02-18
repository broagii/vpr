// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";

import { Parser } from 'json2csv';

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
// app.post(
//   shopify.config.webhooks.path,
//   shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
// );

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

app.post("/api/products/export", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const products = await client.request(`
    query {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            createdAt
            variants(first: 1) {
              edges {
                node {
                  price
                }
              }
            }
            description
          }
        }
        pageInfo {
          hasNextPage
        }
      }
  }
    `);

  const json2csv = new Parser({ fields: [
    {
      label: 'ID',
      value: 'node.id'
    },
    {
      label: 'Title',
      value: 'node.title'
    },
    {
      label: 'Description',
      value: 'node.description'
    },
    {
      label: 'Created At',
      value: 'node.createdAt'
    },
    {
      label: 'Price',
      value: 'node.variants.edges[0].node.price'
    }
  ] });
    const csv = json2csv.parse(products.data.products.edges);
    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');
    return res.send(csv);
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});



app.listen(PORT);
