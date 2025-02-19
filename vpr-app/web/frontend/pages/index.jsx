import {
  LegacyCard,
  Page,
  Layout,
  Button,
  LegacyStack,
  DataTable,
  Text,
  Box,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";
import { useQuery } from "react-query";
import { useState } from "react";
import { Icon } from "@shopify/polaris";
import { DeleteMajor } from "@shopify/polaris-icons";

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
  const [productToDelete, setProductToDelete] = useState(null);
  const { data = [], refetch: refetchProducts } = useQuery({
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

  const confirmDeleteProduct = () => {
    if (!productToDelete) return;

    fetch(`/api/products/${productToDelete}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          shopify.toast.show("Product deleted successfully", {
            duration: 3000,
            error: false,
          });
          refetchProducts();
        }
      })
      .catch(() => {
        shopify.toast.show("Product delete failed", {
          duration: 3000,
          error: true,
        });
      })
      .finally(() => {
        setProductToDelete(null);
        shopify.modal.hide("confirm-modal");
      });
  };

  const cancelDeleteProduct = () => {
    setProductToDelete(null);
    shopify.modal.hide("confirm-modal");
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
                  "#",
                ]}
                rows={data.map((product) => [
                  product.node.legacyResourceId,
                  product.node.title,
                  product.node.description,
                  product.node.createdAt,
                  product.node.variants.edges[0].node.price,
                  <Button
                    plain
                    onClick={() => {
                      setProductToDelete(product.node.legacyResourceId);
                      shopify.modal.show("confirm-modal");
                    }}
                    icon={DeleteMajor}
                  ></Button>,
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
      <ui-modal id="confirm-modal">
        <div style={{ padding: "20px" }}>
          <p>Are you sure you want to delete this product?</p>
        </div>
        <ui-title-bar title="Title">
          <button variant="primary" onClick={confirmDeleteProduct}>
            Delete
          </button>
          <button onClick={cancelDeleteProduct}>Cancel</button>
        </ui-title-bar>
      </ui-modal>
    </Page>
  );
}
