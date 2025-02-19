import {
  LegacyCard,
  Page,
  Layout,
  Button,
  LegacyStack,
  DataTable,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";
import { useQuery } from "react-query";
import { useState } from "react";

const downloadFile = (file) => {
  const a = document.createElement("a");
  a.href = file;
  a.download = "products.csv";
  a.click();
};

export default function HomePage() {
  const { t } = useTranslation();
  const shopify = useAppBridge();
  const [loading, setLoading] = useState(false);
  const { data = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products", { method: "GET" });
      return await response.json();
    },
    refetchOnWindowFocus: true,
    enabled: true,
  });

  const handleExportProducts = () => {
    setLoading(true);
    fetch("/api/products/export", { method: "POST" })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        downloadFile(url);
        shopify.toast.show("Products exported successfully", {
          duration: 3000,
          error: false,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Page fullWidth>
      <TitleBar title={t("HomePage.title")} />
      <Layout>
        <Layout.Section fullWidth>
          <LegacyCard sectioned>
            <LegacyStack vertical spacing="loose">
              <DataTable
                hideScrollIndicator
                columnContentTypes={["text", "text", "text", "text", "numeric"]}
                headings={[
                  "Product",
                  "Title",
                  "Description",
                  "Created At",
                  "Price",
                ]}
                rows={data.map((product) => [
                  product.node.id,
                  product.node.title,
                  product.node.description,
                  product.node.createdAt,
                  product.node.variants.edges[0].node.price,
                ])}
              />

              <Button
                primary
                loading={loading}
                disabled={loading}
                onClick={handleExportProducts}
              >
                Export Products
              </Button>
            </LegacyStack>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
