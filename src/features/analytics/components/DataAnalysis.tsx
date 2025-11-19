import { useVaultStore } from "../../../store/vault.store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const DataAnalysis = () => {
  const { decryptedVault } = useVaultStore();

  if (!decryptedVault) {
    return null; // Or a loading state
  }

  const totalLugares = decryptedVault.lugares.length;
  const totalEntradas = decryptedVault.lugares.reduce(
    (acc, lugar) => acc + lugar.entradas.length,
    0,
  );

  // Calculate average rating
  let totalRating = 0;
  let ratingCount = 0;
  decryptedVault.lugares.forEach((lugar) => {
    lugar.entradas.forEach((entrada) => {
      if (entrada.rating !== undefined) {
        // Assuming rating is a number
        totalRating += entrada.rating;
        ratingCount++;
      }
    });
  });
  const averageRating =
    ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "N/A";

  // Get most used tags (example: top 3)
  const tagCounts: { [key: string]: number } = {};
  decryptedVault.lugares.forEach((lugar) => {
    lugar.entradas.forEach((entrada) => {
      entrada.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
  });
  const sortedTags = Object.entries(tagCounts).sort(
    ([, countA], [, countB]) => countB - countA,
  );
  const mostUsedTags =
    sortedTags
      .slice(0, 3)
      .map(([tag]) => tag)
      .join(", ") || "N/A";

  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle>Data Analysis</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Total Places</p>
          <p className="text-2xl font-bold">{totalLugares}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Total Entries</p>
          <p className="text-2xl font-bold">{totalEntradas}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Average Rating</p>
          <p className="text-2xl font-bold">{averageRating}</p>
        </div>
        <div className="space-y-1 col-span-2">
          <p className="text-sm font-medium">Most Used Tags</p>
          <p className="text-lg font-bold">{mostUsedTags}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataAnalysis;
