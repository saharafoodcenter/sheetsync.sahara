
"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import InventoryPageContent from "@/components/sheet-sync/inventory-page-content";

export default function InventoryPage() {
  return (
    <ProtectedRoute>
      <InventoryPageContent />
    </ProtectedRoute>
  );
}
