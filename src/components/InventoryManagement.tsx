
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, AlertTriangle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  prod_id: number;
  prod_nombre: string;
  prod_descripcion: string;
  prod_precio_unitario: number;
}

interface Inventory {
  inv_id: number;
  inv_fecha_actualizacion: string;
  prod_id: number;
  inv_cantidad_actual: number;
  inv_observaciones: string;
}

const InventoryManagement = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([
    {
      prod_id: 1,
      prod_nombre: "Shampoo Nutritivo",
      prod_descripcion: "Shampoo para cabello seco y dañado",
      prod_precio_unitario: 35000
    },
    {
      prod_id: 2,
      prod_nombre: "Acondicionador Hidratante",
      prod_descripcion: "Acondicionador para todo tipo de cabello",
      prod_precio_unitario: 28000
    },
    {
      prod_id: 3,
      prod_nombre: "Tinte Profesional",
      prod_descripcion: "Tinte permanente profesional",
      prod_precio_unitario: 45000
    },
    {
      prod_id: 4,
      prod_nombre: "Esmalte Premium",
      prod_descripcion: "Esmalte de larga duración",
      prod_precio_unitario: 15000
    }
  ]);

  const [inventory, setInventory] = useState<Inventory[]>([
    {
      inv_id: 1,
      inv_fecha_actualizacion: "2024-01-15",
      prod_id: 1,
      inv_cantidad_actual: 25,
      inv_observaciones: "Stock normal"
    },
    {
      inv_id: 2,
      inv_fecha_actualizacion: "2024-01-15",
      prod_id: 2,
      inv_cantidad_actual: 18,
      inv_observaciones: "Stock normal"
    },
    {
      inv_id: 3,
      inv_fecha_actualizacion: "2024-01-15",
      prod_id: 3,
      inv_cantidad_actual: 5,
      inv_observaciones: "Stock bajo - Reabastecer pronto"
    },
    {
      inv_id: 4,
      inv_fecha_actualizacion: "2024-01-15",
      prod_id: 4,
      inv_cantidad_actual: 2,
      inv_observaciones: "Stock crítico - Reabastecer urgente"
    }
  ]);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);

  const handleAddProduct = () => {
    if (!newProduct.prod_nombre || !newProduct.prod_precio_unitario) {
      toast({
        title: "Error",
        description: "Por favor completa nombre y precio del producto",
        variant: "destructive"
      });
      return;
    }

    const product: Product = {
      prod_id: Math.max(...products.map(p => p.prod_id), 0) + 1,
      prod_nombre: newProduct.prod_nombre || "",
      prod_descripcion: newProduct.prod_descripcion || "",
      prod_precio_unitario: newProduct.prod_precio_unitario || 0
    };

    const inventoryEntry: Inventory = {
      inv_id: Math.max(...inventory.map(i => i.inv_id), 0) + 1,
      inv_fecha_actualizacion: new Date().toISOString().split('T')[0],
      prod_id: product.prod_id,
      inv_cantidad_actual: 0,
      inv_observaciones: "Producto nuevo - Sin stock inicial"
    };

    setProducts([...products, product]);
    setInventory([...inventory, inventoryEntry]);
    setNewProduct({});
    setIsAddingProduct(false);
    toast({
      title: "Producto agregado",
      description: "El producto ha sido agregado al inventario"
    });
  };

  const handleUpdateInventory = () => {
    if (!editingInventory) return;

    setInventory(inventory.map(inv => 
      inv.inv_id === editingInventory.inv_id ? {
        ...editingInventory,
        inv_fecha_actualizacion: new Date().toISOString().split('T')[0]
      } : inv
    ));
    setEditingInventory(null);
    toast({
      title: "Inventario actualizado",
      description: "Los datos del inventario han sido actualizados"
    });
  };

  const getProductInfo = (prodId: number) => {
    return products.find(p => p.prod_id === prodId);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity <= 5) return { status: "Crítico", color: "bg-red-100 text-red-700" };
    if (quantity <= 10) return { status: "Bajo", color: "bg-yellow-100 text-yellow-700" };
    return { status: "Normal", color: "bg-green-100 text-green-700" };
  };

  const getTotalInventoryValue = () => {
    return inventory.reduce((total, inv) => {
      const product = getProductInfo(inv.prod_id);
      return total + (product ? product.prod_precio_unitario * inv.inv_cantidad_actual : 0);
    }, 0);
  };

  const getLowStockItems = () => {
    return inventory.filter(inv => inv.inv_cantidad_actual <= 10);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h2>
          <p className="text-gray-600">Administra productos y control de stock</p>
        </div>
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
                <Label htmlFor="prod-precio">Precio Unitario *</Label>
                <Input
                  id="prod-precio"
                  type="number"
                  value={newProduct.prod_precio_unitario || ""}
                  onChange={(e) => setNewProduct({...newProduct, prod_precio_unitario: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddProduct}>Agregar Producto</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">productos registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Inventario</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalInventoryValue().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">valor total en stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{getLowStockItems().length}</div>
            <p className="text-xs text-muted-foreground">productos necesitan reposición</p>
          </CardContent>
        </Card>
      </div>

      {getLowStockItems().length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Stock Bajo
            </CardTitle>
            <CardDescription>
              Los siguientes productos necesitan reposición urgente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getLowStockItems().map((inv) => {
                const product = getProductInfo(inv.prod_id);
                return (
                  <div key={inv.inv_id} className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="font-medium">{product?.prod_nombre}</span>
                    <Badge variant="destructive">
                      {inv.inv_cantidad_actual} unidades restantes
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Control de Inventario</CardTitle>
          <CardDescription>
            Estado actual del stock de productos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead>Cantidad Actual</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Actualización</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((inv) => {
                const product = getProductInfo(inv.prod_id);
                const stockStatus = getStockStatus(inv.inv_cantidad_actual);
                return (
                  <TableRow key={inv.inv_id}>
                    <TableCell>
                      <div className="font-medium">{product?.prod_nombre}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">{product?.prod_descripcion}</div>
                    </TableCell>
                    <TableCell>${product?.prod_precio_unitario.toLocaleString()}</TableCell>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingInventory(inv)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                  {getProductInfo(editingInventory.prod_id)?.prod_nombre}
                </div>
              </div>
              <div>
                <Label htmlFor="edit-cantidad">Cantidad Actual</Label>
                <Input
                  id="edit-cantidad"
                  type="number"
                  value={editingInventory.inv_cantidad_actual}
                  onChange={(e) => setEditingInventory({
                    ...editingInventory, 
                    inv_cantidad_actual: parseInt(e.target.value)
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
              <Button onClick={handleUpdateInventory}>Actualizar Inventario</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InventoryManagement;
