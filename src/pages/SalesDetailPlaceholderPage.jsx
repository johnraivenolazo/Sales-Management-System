import { useParams } from "react-router-dom";
import PlaceholderPage from "./PlaceholderPage.jsx";

function SalesDetailPlaceholderPage() {
  const { transNo } = useParams();

  return (
    <PlaceholderPage
      title={`Sales Detail ${transNo}`}
      routePath={`/sales/${transNo}`}
      summary="Transaction detail placeholder with route params already wired for the future sales detail page."
    />
  );
}

export default SalesDetailPlaceholderPage;
