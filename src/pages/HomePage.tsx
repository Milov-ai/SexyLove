import { useState, useEffect, useRef } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useVaultStore } from "../store/vault.store";
import type { Lugar, Fantasy } from "../schemas/vault";
import MapMarker from "../features/places/components/MapMarker";
import ChronicleView from "../features/places/components/ChronicleView";
import { getBounds } from "../lib/geo";
import { BookIcon, HeartIcon } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ExpandableTabs from "@/components/ui/ExpandableTabs";
import Header from "../layouts/Header";
import LugaresCollapsible from "../features/places/components/LugaresCollapsible";
import LugarCreateModal from "../features/places/components/LugarCreateModal";
import { Button } from "@/components/ui/button";
import KissAnimation from "../components/common/KissAnimation";
import LipsIconUrl from "@/assets/lips.svg";
import OptionsMenu from "../components/common/OptionsMenu";
import DataAnalysis from "../features/analytics/components/DataAnalysis";
import { CrudModal } from "../components/common/CrudModal";
import FantasyModal from "../features/fantasies/components/FantasyModal";
import DeleteConfirmationModal from "../components/common/DeleteConfirmationModal";

import EphemeralChat from "../features/chat/components/EphemeralChat";

const HomePage = () => {
  const {
    decryptedVault,
    showHeatmap,
    getAllEntradas,
    justAddedLugarId,
    setJustAddedLugarId,
    lugarToCenter,
    setLugarToCenter,
    shouldFitBounds,
    setShouldFitBounds,
    addCategoryItem,
    deleteCategoryItem,
    updateCategoryItem,
  } = useVaultStore();

  const [selectedLugar, setSelectedLugar] = useState<Lugar | null>(null);
  const [isLugarCreateModalOpen, setIsLugarCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showKissAnimation, setShowKissAnimation] = useState(false);
  const [showDataAnalysis, setShowDataAnalysis] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    "toys" | "settingPlaces" | "categories" | null
  >(null);
  const [isFantasyModalOpen, setIsFantasyModalOpen] = useState(false);
  const [editingFantasy, setEditingFantasy] = useState<Fantasy | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteUsageCount, setDeleteUsageCount] = useState(0);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDeleteItemClick = async (item: string) => {
    if (!editingCategory || !decryptedVault) return;

    let count = 0;
    if (editingCategory === "categories") {
      // Check Lugar.calidad
      count = decryptedVault.lugares.reduce(
        (acc, lugar) => acc + (lugar.calidad.includes(item) ? 1 : 0),
        0,
      );
    } else if (editingCategory === "toys") {
      // Check Fantasy.toys
      count = decryptedVault.fantasies.reduce(
        (acc, fantasy) => acc + (fantasy.toys.includes(item) ? 1 : 0),
        0,
      );
    } else if (editingCategory === "settingPlaces") {
      // Check Fantasy.place
      count = decryptedVault.fantasies.reduce(
        (acc, fantasy) => acc + (fantasy.settingPlaces.includes(item) ? 1 : 0),
        0,
      );
    }

    setItemToDelete(item);
    setDeleteUsageCount(count);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (editingCategory && itemToDelete) {
      await deleteCategoryItem(editingCategory, itemToDelete);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleOpenAddFantasy = () => {
    setEditingFantasy(null);
    setIsFantasyModalOpen(true);
  };

  const handleOpenEditFantasy = (fantasy: Fantasy) => {
    setEditingFantasy(fantasy);
    setIsFantasyModalOpen(true);
  };

  useEffect(() => {
    if (mapRef.current && decryptedVault && decryptedVault.lugares.length > 0) {
      const bounds = getBounds(decryptedVault.lugares);
      if (bounds) {
        mapRef.current.fitBounds(bounds, { padding: 100, duration: 2000 });
      }
    }
  }, [decryptedVault]);

  useEffect(() => {
    if (mapRef.current && decryptedVault) {
      if (shouldFitBounds) {
        const bounds = getBounds(decryptedVault.lugares);
        if (bounds) {
          mapRef.current.fitBounds(bounds, { padding: 100, duration: 2000 });
        }
        setShouldFitBounds(false);
      } else if (
        lugarToCenter &&
        lugarToCenter.coordinates &&
        !isNaN(lugarToCenter.coordinates.lon) &&
        !isNaN(lugarToCenter.coordinates.lat)
      ) {
        mapRef.current.flyTo({
          center: [
            lugarToCenter.coordinates.lon,
            lugarToCenter.coordinates.lat,
          ],
          zoom: 13,
          duration: 2000,
          essential: true,
        });
        setLugarToCenter(null);
      } else if (justAddedLugarId) {
        const newLugar = decryptedVault.lugares.find(
          (l: Lugar) => l.id === justAddedLugarId,
        );
        if (
          newLugar &&
          newLugar.coordinates &&
          !isNaN(newLugar.coordinates.lon) &&
          !isNaN(newLugar.coordinates.lat)
        ) {
          mapRef.current.flyTo({
            center: [newLugar.coordinates.lon, newLugar.coordinates.lat],
            zoom: 13,
            duration: 2000,
            essential: true,
          });
        }
        setJustAddedLugarId(null);
      }
    }
  }, [
    justAddedLugarId,
    lugarToCenter,
    shouldFitBounds,
    setJustAddedLugarId,
    setLugarToCenter,
    setShouldFitBounds,
    decryptedVault,
  ]);

  const allEntradas = getAllEntradas();
  const heatmapData: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: "FeatureCollection",
    features: allEntradas
      .filter(
        (entrada) =>
          entrada.lugar.coordinates &&
          !isNaN(entrada.lugar.coordinates.lon) &&
          !isNaN(entrada.lugar.coordinates.lat),
      )
      .map((entrada) => ({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [
            entrada.lugar.coordinates!.lon,
            entrada.lugar.coordinates!.lat,
          ],
        },
      })),
  };

  const favoriteLugares = decryptedVault
    ? decryptedVault.lugares.filter((lugar: Lugar) => lugar.favorite)
    : [];

  const tabs = [
    { name: "All", value: "all", icon: BookIcon },
    { name: "Favorites", value: "favorites", icon: HeartIcon },
  ];

  const lugaresToShow =
    activeTab === "all"
      ? decryptedVault
        ? decryptedVault.lugares
        : []
      : favoriteLugares;

  const categoryTitles = {
    toys: "Manage Toys",
    settingPlaces: "Manage Places",
    categories: "Manage Categories",
  };

  return (
    <>
      <Header />
      <div className="p-4 md:p-8 pt-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4"
        >
          <div className="lg:col-span-7 space-y-6">
            <Card id="mapa">
              <CardHeader>
                <CardTitle>Geografía del Deseo</CardTitle>
              </CardHeader>
              <CardContent className="aspect-square lg:aspect-auto lg:h-[600px] overflow-hidden rounded-lg">
                <Map
                  ref={mapRef}
                  initialViewState={{
                    latitude: 40.7128,
                    longitude: -74.006,
                    zoom: 3,
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "0.75rem",
                  }}
                  mapStyle="https://api.maptiler.com/maps/019a136b-d867-76fa-a7f4-c8574a83c377/style.json?key=ZgPtG2K57Kd9z6tNh1KQ"
                >
                  {lugaresToShow.map((lugar: Lugar) =>
                    lugar.coordinates &&
                    !isNaN(lugar.coordinates.lat) &&
                    !isNaN(lugar.coordinates.lon) ? (
                      <Marker
                        key={lugar.id}
                        latitude={lugar.coordinates.lat}
                        longitude={lugar.coordinates.lon}
                      >
                        <MapMarker
                          nombre={lugar.nombre}
                          onClick={() => setSelectedLugar(lugar)}
                        />
                      </Marker>
                    ) : null,
                  )}
                  {showHeatmap && (
                    <Source id="heatmap-data" type="geojson" data={heatmapData}>
                      <Layer
                        id="heatmap-layer"
                        type="heatmap"
                        paint={{
                          "heatmap-weight": 1,
                          "heatmap-intensity": 1,
                          "heatmap-color": [
                            "interpolate",
                            ["linear"],
                            ["heatmap-density"],
                            0,
                            "rgba(33,102,172,0)",
                            0.2,
                            "rgb(103,169,207)",
                            0.4,
                            "rgb(209,229,240)",
                            0.6,
                            "rgb(253,219,199)",
                            0.8,
                            "rgb(239,138,98)",
                            1,
                            "rgb(178,24,43)",
                          ],
                          "heatmap-radius": 20,
                          "heatmap-opacity": 0.8,
                        }}
                      />
                    </Source>
                  )}
                </Map>
              </CardContent>
            </Card>
            {isDesktop && <EphemeralChat />}
          </div>
          <div className="lg:col-span-5">
            <LugaresCollapsible
              lugares={lugaresToShow}
              onAddLugar={() => setIsLugarCreateModalOpen(true)}
            />
            {!isDesktop && (
              <div className="mt-4">
                <EphemeralChat />
              </div>
            )}
            <Button
              className="w-full mt-4 bg-transparent hover:bg-transparent flex justify-center items-center h-32"
              onClick={() => setShowKissAnimation(true)}
            >
              <div
                className="w-28 h-20"
                style={{
                  backgroundColor: "var(--primary)",
                  maskImage: `url(${LipsIconUrl})`,
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskImage: `url(${LipsIconUrl})`,
                  WebkitMaskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                }}
              ></div>
            </Button>
            <div className="mt-4 space-y-4">
              {showDataAnalysis && <DataAnalysis />}
              <OptionsMenu
                isDataAnalysisActive={showDataAnalysis}
                onDataAnalysisToggle={setShowDataAnalysis}
                onManageCategory={setEditingCategory}
                onAddFantasyClick={handleOpenAddFantasy}
                onEditFantasyClick={handleOpenEditFantasy}
              />
            </div>
          </div>
        </motion.div>
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <ExpandableTabs
            tabs={tabs}
            defaultValue="all"
            onTabChange={setActiveTab}
          />
        </div>
      </div>
      {selectedLugar && (
        <ChronicleView
          open={!!selectedLugar}
          onOpenChange={() => setSelectedLugar(null)}
          lugar={selectedLugar}
        />
      )}
      <LugarCreateModal
        open={isLugarCreateModalOpen}
        onOpenChange={setIsLugarCreateModalOpen}
      />
      {showKissAnimation && (
        <KissAnimation onComplete={() => setShowKissAnimation(false)} />
      )}

      {editingCategory && decryptedVault && (
        <CrudModal
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          title={editingCategory ? categoryTitles[editingCategory] : ""}
          items={
            editingCategory && decryptedVault
              ? decryptedVault[editingCategory]
              : []
          }
          onAdd={(item) =>
            editingCategory && addCategoryItem(editingCategory, item)
          }
          onEdit={(oldItem, newItem) =>
            editingCategory &&
            updateCategoryItem(editingCategory, oldItem, newItem)
          }
          onDelete={handleDeleteItemClick}
        />
      )}

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        itemType={editingCategory ? categoryTitles[editingCategory] : "Item"}
        itemName={itemToDelete || ""}
        usageCount={deleteUsageCount}
      />
      <FantasyModal
        open={isFantasyModalOpen}
        onOpenChange={setIsFantasyModalOpen}
        fantasy={editingFantasy}
      />
    </>
  );
};

export default HomePage;
