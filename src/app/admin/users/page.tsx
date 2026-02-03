import { AdminSidebar } from "@/components/admin/admin-sidebar"

const page = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 bg-background min-h-screen">
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold text-primary">User Management</h1>
            <p className="text-muted-foreground mt-1">Centralized administration of accounts and roles</p>
          </div>
        </header>
      </main>
     
    </div>
  )
}

export default page
