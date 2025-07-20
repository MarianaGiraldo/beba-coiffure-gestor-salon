import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, AlertTriangle, Package, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PurchaseManagement from "./PurchaseManagement";

interface Product {
  prod_id: number;
  prod_nombre: string;
  prod_descripcion: string;
  prod_cantidad_disponible: number;
  prod_precio_unitario: number;
}

interface InventoryComplete {
  inv_id: number;
  inv_fecha_actualizacion: string;
  prod_id: number;
  inv_cantidad_actual: number;
  inv_observaciones: string;
  prod_nombre: string;
  prod_descripcion: string;
  prod_cantidad_disponible: number;
  prod_precio_unitario: number;
}

interface InventoryMetrics {
  productos_bajos: number;
  total_productos: number;
  valor_inventario: number;
}

const InventoryManagement = () => {
  const { toast } = useToast();
  // API URL is configured through Docker environment variables
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  
  const [inventory, setInventory] = useState<InventoryComplete[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState<InventoryMetrics>({
    productos_bajos: 0,
    total_productos: 0,
    valor_inventario: 0
  });
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingInventory, setEditingInventory] = useState<InventoryComplete | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load data when component mounts
  useEffect(() => {
    fetchInventory();
    fetchProducts();
    fetchMetrics();
  }, []);

  // Get authentication token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || null;
  };

  // API function to fetch inventory
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/inventory`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setInventory(data.inventory || []);
      } else {
        throw new Error(data.message || 'Failed to fetch inventory');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el inventario",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // API function to fetch products
  const fetchProducts = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/inventory/products`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setProducts(data.products || []);
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar los productos",
        variant: "destructive"
      });
    }
  };

  // API function to fetch metrics
  const fetchMetrics = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/dashboard/inventory`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setMetrics(data.data || {
          productos_bajos: 0,
          total_productos: 0,
          valor_inventario: 0
        });
      } else {
        throw new Error(data.message || 'Failed to fetch metrics');
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      // Don't show error toast for metrics as it's not critical
    }
  };

  // API function to create product
  const createProduct = async (product: Partial<Product>) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/inventory/products`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create product');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  // API function to update inventory
  const updateInventory = async (invId: number, cantidad: number, observaciones: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/inventory/${invId}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cantidad: cantidad,
          observaciones: observaciones
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update inventory');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  // API function to delete inventory
  const deleteInventory = async (invId: number) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/inventory/${invId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete inventory');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.prod_nombre || !newProduct.prod_precio_unitario) {
      toast({
        title: "Error",
        description: "Por favor completa nombre y precio del producto",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      await createProduct({
        prod_nombre: newProduct.prod_nombre,
        prod_descripcion: newProduct.prod_descripcion || "",
        prod_cantidad_disponible: newProduct.prod_cantidad_disponible || 0,
        prod_precio_unitario: newProduct.prod_precio_unitario
      });

      // Refresh data
      await fetchInventory();
      await fetchProducts();
      await fetchMetrics();

      setNewProduct({});
      setIsAddingProduct(false);
      toast({
        title: "Producto agregado",
        description: "El producto ha sido agregado al inventario exitosamente"
      });
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el producto",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateInventory = async () => {
    if (!editingInventory) return;

    if (editingInventory.inv_cantidad_actual < 0) {
      toast({
        title: "Error",
        description: "La cantidad no puede ser negativa",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      await updateInventory(
        editingInventory.inv_id,
        editingInventory.inv_cantidad_actual,
        editingInventory.inv_observaciones
      );

      // Refresh data
      await fetchInventory();
      await fetchMetrics();

      setEditingInventory(null);
      toast({
        title: "Inventario actualizado",
        description: "Los datos del inventario han sido actualizados exitosamente"
      });
    } catch (error: any) {
      console.error('Error updating inventory:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el inventario",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInventory = async (invId: number, productName: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la entrada de inventario para "${productName}"?`)) {
      try {
        await deleteInventory(invId);

        // Refresh data
        await fetchInventory();
        await fetchMetrics();

        toast({
          title: "Inventario eliminado",
          description: "La entrada de inventario ha sido eliminada exitosamente"
        });
      } catch (error: any) {
        console.error('Error deleting inventory:', error);
        toast({
          title: "Error",
          description: error.message || "No se pudo eliminar la entrada de inventario",
          variant: "destructive"
        });
      }
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity <= 5) return { status: "Crítico", color: "bg-red-100 text-red-700" };
    if (quantity <= 10) return { status: "Bajo", color: "bg-yellow-100 text-yellow-700" };
    return { status: "Normal", color: "bg-green-100 text-green-700" };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">Cargando inventario...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h2>
          <p className="text-gray-600">Administra productos, control de stock y compras</p>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">
            <Package className="h-4 w-4 mr-2" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="purchases">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Compras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
              <DialogTrigger asChild>
                <Button className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                  <DialogDescription>
                    Registra un nuevo producto en el inventario
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="prod-nombre">Nombre del Producto *</Label>
                    <Input
                      id="prod-nombre"
                      value={newProduct.prod_nombre || ""}
                      onChange={(e) => setNewProduct({...newProduct, prod_nombre: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prod-descripcion">Descripción</Label>
                    <Input
                      id="prod-descripcion"
                      value={newProduct.prod_descripcion || ""}
                      onChange={(e) => setNewProduct({...newProduct, prod_descripcion: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prod-cantidad">Cantidad Inicial</Label>
                    <Input
                      id="prod-cantidad"
                      type="number"
                      min="0"
                      value={newProduct.prod_cantidad_disponible || 0}
                      onChange={(e) => setNewProduct({...newProduct, prod_cantidad_disponible: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prod-precio">Precio Unitario *</Label>
                    <Input
                      id="prod-precio"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.prod_precio_unitario || ""}
                      onChange={(e) => setNewProduct({...newProduct, prod_precio_unitario: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleAddProduct} 
                    disabled={submitting}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    {submitting ? "Agregando..." : "Agregar Producto"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total Inventario</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.valor_inventario.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {inventory.length} productos en stock
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productos con Stock Bajo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{metrics.productos_bajos}</div>
                <p className="text-xs text-muted-foreground">
                  Necesitan reabastecimiento
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total_productos}</div>
                <p className="text-xs text-muted-foreground">
                  Productos registrados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventario de Productos</CardTitle>
              <CardDescription>
                Gestiona el stock actual de todos los productos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Precio Unitario</TableHead>
                    <TableHead>Stock Actual</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última Actualización</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((inv) => {
                    const stockStatus = getStockStatus(inv.inv_cantidad_actual);
                    return (
                      <TableRow key={inv.inv_id}>
                        <TableCell>
                          <div className="font-medium">{inv.prod_nombre}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">{inv.prod_descripcion}</div>
                        </TableCell>
                        <TableCell>${inv.prod_precio_unitario.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="font-medium">{inv.inv_cantidad_actual} unidades</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>
                            {stockStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{inv.inv_fecha_actualizacion}</TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {inv.inv_observaciones || "Sin observaciones"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingInventory(inv)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteInventory(inv.inv_id, inv.prod_nombre)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit Inventory Dialog */}
          {editingInventory && (
            <Dialog open={!!editingInventory} onOpenChange={() => setEditingInventory(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Actualizar Inventario</DialogTitle>
                  <DialogDescription>
                    Modifica la cantidad y observaciones del producto
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label>Producto</Label>
                    <div className="p-2 bg-gray-100 rounded">
                      {editingInventory.prod_nombre}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-cantidad">Cantidad Actual</Label>
                    <Input
                      id="edit-cantidad"
                      type="number"
                      min="0"
                      value={editingInventory.inv_cantidad_actual}
                      onChange={(e) => setEditingInventory({
                        ...editingInventory, 
                        inv_cantidad_actual: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-observaciones">Observaciones</Label>
                    <Input
                      id="edit-observaciones"
                      value={editingInventory.inv_observaciones}
                      onChange={(e) => setEditingInventory({
                        ...editingInventory, 
                        inv_observaciones: e.target.value
                      })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleUpdateInventory}
                    disabled={submitting}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    {submitting ? "Actualizando..." : "Actualizar Inventario"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        <TabsContent value="purchases">
          <PurchaseManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryManagement;