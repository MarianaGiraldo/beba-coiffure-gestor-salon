
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Package, Scissors, DollarSign, Truck, Gift, LogOut, Receipt, RefreshCw } from "lucide-react";
import EmployeeManagement from "@/components/EmployeeManagement";
import ClientManagement from "@/components/ClientManagement";
import InventoryManagement from "@/components/InventoryManagement";
import ServiceManagement from "@/components/ServiceManagement";
import FinancialManagement from "@/components/FinancialManagement";
import SupplierManagement from "@/components/SupplierManagement";
import PromotionManagement from "@/components/PromotionManagement";
import InvoiceManagement from "@/components/InvoiceManagement";
import LoginPage from "@/components/LoginPage";
import { useToast } from "@/hooks/use-toast";

interface DashboardMetrics {
  empleados_activos: number;
  citas_hoy: number;
  ingresos_mensuales: number;
  productos_bajos: number;
}

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    empleados_activos: 0,
    citas_hoy: 0,
    ingresos_mensuales: 0,
    productos_bajos: 0
  });
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  // API URL configuration
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  // Get authentication token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || null;
  };

  // Fetch dashboard metrics from API
  const fetchDashboardMetrics = async () => {
    if (currentUser?.userType === 'cliente') {
      // Skip fetching metrics for clients
      return;
    }
    setIsLoadingMetrics(true);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/dashboard`, {
        headers,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setDashboardMetrics(result.data);
        }
      } else {
        throw new Error('Failed to fetch dashboard metrics');
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las métricas del dashboard",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  // Load dashboard metrics when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardMetrics();
    }
  }, [isAuthenticated]);

  const handleLogin = (userType: 'admin' | 'employee' | 'cliente', userData: any) => {
    setIsAuthenticated(true);
    // Set default tab based on user type
    if (userType === 'cliente') {
      userData.name = userData.cli_nombre || userData.nombre || "Cliente";
      userData.email = userData.cli_email || userData.email || "";
      setActiveTab("clients");
    } else {
      setActiveTab("dashboard");
    }
    setCurrentUser({ userType, ...userData });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab("dashboard");
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
      variant: "default"
    });
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <header className="bg-white shadow-sm border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Scissors className="h-8 w-8 text-pink-600" />
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Beba Coiffure</h1>
                <p className="text-sm text-gray-500">Panel de Administración</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                {currentUser?.userType === 'admin' ? 'Administrador' :
                 currentUser?.userType === 'employee' ? 'Empleado' : 'Cliente'}
              </Badge>
              <span className="text-sm text-gray-600">
                Bienvenido, {currentUser?.nombre || currentUser?.userType}
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full mb-6 ${currentUser?.userType === 'cliente' ? 'grid-cols-4' : 'grid-cols-8'}`}>
            {currentUser?.userType !== 'cliente' && (
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Panel
              </TabsTrigger>
            )}
            {currentUser?.userType !== 'cliente' && (
              <TabsTrigger value="employees" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Empleados
              </TabsTrigger>
            )}
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Clientes
            </TabsTrigger>
            {currentUser?.userType !== 'cliente' && (
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Inventario
              </TabsTrigger>
            )}
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              Servicios
            </TabsTrigger>
            {currentUser?.userType !== 'cliente' && (
              <TabsTrigger value="suppliers" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Proveedores
              </TabsTrigger>
            )}
            <TabsTrigger value="promotions" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Promociones
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Facturas
            </TabsTrigger>
          </TabsList>

          {currentUser?.userType !== 'cliente' && (
            <TabsContent value="dashboard" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Métricas del Dashboard</h2>
                <Button
                  onClick={fetchDashboardMetrics}
                  variant="outline"
                  size="sm"
                  disabled={isLoadingMetrics}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingMetrics ? 'animate-spin' : ''}`} />
                  {isLoadingMetrics ? "Actualizando..." : "Actualizar"}
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingMetrics ? "..." : (dashboardMetrics.empleados_activos || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Personal disponible</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingMetrics ? "..." : (dashboardMetrics.citas_hoy || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Citas programadas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingMetrics ? "..." : `$${(dashboardMetrics.ingresos_mensuales || 0).toLocaleString()}`}
                    </div>
                    <p className="text-xs text-muted-foreground">Mes actual</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Productos Bajos</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingMetrics ? "..." : (dashboardMetrics.productos_bajos || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Requieren reposición</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen Financiero</CardTitle>
                  <CardDescription>Vista general de las finanzas del salón</CardDescription>
                </CardHeader>
                <CardContent>
                  <FinancialManagement />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {currentUser?.userType !== 'cliente' && (
            <TabsContent value="employees">
              <EmployeeManagement />
            </TabsContent>
          )}

          <TabsContent value="clients">
            <ClientManagement currentUser={currentUser} />
          </TabsContent>

          {currentUser?.userType !== 'cliente' && (
            <TabsContent value="inventory">
              <InventoryManagement />
            </TabsContent>
          )}

          <TabsContent value="services">
            <ServiceManagement currentUser={currentUser} />
          </TabsContent>

          {currentUser?.userType !== 'cliente' && (
            <TabsContent value="suppliers">
              <SupplierManagement />
            </TabsContent>
          )}

          <TabsContent value="promotions">
            <PromotionManagement currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoiceManagement currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
