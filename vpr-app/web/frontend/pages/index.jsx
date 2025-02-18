import {
  Card,
  Page,
  Layout,
  Button
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";
import { useQuery } from "react-query";

import { trophyImage } from "../assets";

import { ProductsCard } from "../components";

const downloadFile = (file) => {
  const a = document.createElement('a');
  a.href = file;
  a.download = 'products.csv';
  a.click();
};

export default function HomePage() {
  const { t } = useTranslation();
  const {
    data,
    refetch: refetchProductExport,
  } = useQuery({
    queryKey: ["productsExport"],
    queryFn: async () => {
      const response = await fetch("/api/products/export", { method: "POST", }).then(res => res.blob()).then(blob => {
        const url = URL.createObjectURL(blob);
        downloadFile(url);
      });
      return await response.json();
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });
  return (
    <Page narrowWidth>
      <TitleBar title={t("HomePage.title")} />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Button
              primary
              onClick={() => {
                refetchProductExport();
              }}
            >
              Export Products
            </Button>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
