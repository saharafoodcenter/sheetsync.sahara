
"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import HomePageContent from "@/components/sheet-sync/home-page-content";

export default function Home() {
    return (
        <ProtectedRoute>
            <HomePageContent />
        </ProtectedRoute>
    );
}
