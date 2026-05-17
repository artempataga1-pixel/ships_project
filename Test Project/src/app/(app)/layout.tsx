import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar />
      <main style={{
        flex: 1,
        padding: "2rem 1.5rem",
        maxWidth: "1100px",
        width: "100%",
        margin: "0 auto",
      }}>
        {children}
      </main>
    </div>
  );
}
