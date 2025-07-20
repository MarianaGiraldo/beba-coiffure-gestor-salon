import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Purchase {
  cop_fecha_compra: string;
  proveedor: string;
  productos: string;
  cop_total_compra: number;
  cop_metodo_pago: string;
}

interface PurchaseDetail {
  prod_id: number;
  dec_cantidad: number;
  dec_precio_unitario: number;
}

interface CreatePurchaseRequest {
  cop_fecha_compra: string;
  prov_id: number;
  gas_id: number;
  cop_metodo_pago: string;
  detalles: PurchaseDetail[];
}

interface Supplier {
  prov_id: number;
  prov_nombre: string;
}

interface Expense {
  gas_id: number;
  gas_descripcion: string;
  gas_tipo: string;
}

interface Product {
  prod_id: number;
  prod_nombre: string;
  prod_precio_unitario: number;
}

const PurchaseManagement = () => {
  const { toast } = useToast();
  
  // API URL configuration
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  // Get authentication token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || null;
  };

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);

  // New purchase form state
  const [newPurchase, setNewPurchase] = useState<CreatePurchaseRequest>({
    cop_fecha_compra: new Date().toISOString().split('T')[0],
    prov_id: 0,
    gas_id: 0,
    cop_metodo_pago: '',
    detalles: []
  });

  // Purchase detail form state
  const [newDetail, setNewDetail] = useState<PurchaseDetail>({
    prod_id: 0,
    dec_cantidad: 1,
    dec_precio_unitario: 0
  });

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
    fetchExpenses();
    fetchProducts();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/purchases`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPurchases(data.purchases || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar las compras",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/suppliers`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.suppliers || []);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/expenses`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/inventory`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.inventory) {
          const productList = data.inventory.map((item: any) => ({
            prod_id: item.prod_id,
            prod_nombre: item.prod_nombre,
            prod_precio_unitario: item.prod_precio_unitario
          }));
          setProducts(productList);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddDetail = () => {
    if (newDetail.prod_id === 0 || newDetail.dec_cantidad <= 0 || newDetail.dec_precio_unitario <= 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos del detalle",
        variant: "destructive"
      });
      return;
    }

    setNewPurchase(prev => ({
      ...prev,
      detalles: [...prev.detalles, { ...newDetail }]
    }));

    setNewDetail({
      prod_id: 0,
      dec_cantidad: 1,
      dec_precio_unitario: 0
    });
  };

  const handleRemoveDetail = (index: number) => {
    setNewPurchase(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
  };

  const handleCreatePurchase = async () => {
    if (!newPurchase.cop_fecha_compra || newPurchase.prov_id === 0 || 
        newPurchase.gas_id === 0 || !newPurchase.cop_metodo_pago || 
        newPurchase.detalles.length === 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/purchases`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPurchase),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchPurchases();
      setNewPurchase({
        cop_fecha_compra: new Date().toISOString().split('T')[0],
        prov_id: 0,
        gas_id: 0,
        cop_metodo_pago: '',
        detalles: []
      });
      setIsCreatingPurchase(false);

      toast({
        title: "Compra creada",
        description: "La compra ha sido registrada exitosamente"
      });
    } catch (error: any) {
      console.error('Error creating purchase:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la compra",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getProductName = (prodId: number) => {
    const product = products.find(p => p.prod_id === prodId);
    return product ? product.prod_nombre : `Producto #${prodId}`;
  };

  const calculateTotal = () => {
    return newPurchase.detalles.reduce((total, detail) => 
      total + (detail.dec_cantidad * detail.dec_precio_unitario), 0
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">Cargando compras...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compras de Productos</h2>
          <p className="text-gray-600">Gestiona las compras realizadas a proveedores</p>
        </div>
        <Dialog open={isCreatingPurchase} onOpenChange={setIsCreatingPurchase}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Compra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Compra</DialogTitle>
              <DialogDescription>
                Registra una nueva compra de productos a proveedores
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha">Fecha de Compra *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={newPurchase.cop_fecha_compra}
                    onChange={(e) => setNewPurchase({...newPurchase, cop_fecha_compra: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="metodo-pago">Método de Pago *</Label>
                  <Select 
                    value={newPurchase.cop_metodo_pago} 
                    onValueChange={(value) => setNewPurchase({...newPurchase, cop_metodo_pago: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="Transferencia">Transferencia</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="proveedor">Proveedor *</Label>
                  <Select 
                    value={newPurchase.prov_id.toString()} 
                    onValueChange={(value) => setNewPurchase({...newPurchase, prov_id: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.prov_id} value={supplier.prov_id.toString()}>
                          {supplier.prov_nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gasto">Gasto Asociado *</Label>
                  <Select 
                    value={newPurchase.gas_id.toString()} 
                    onValueChange={(value) => setNewPurchase({...newPurchase, gas_id: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar gasto" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenses.map((expense) => (
                        <SelectItem key={expense.gas_id} value={expense.gas_id.toString()}>
                          {expense.gas_descripcion} ({expense.gas_tipo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Purchase Details Section */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">Detalles de Compra</h3>
                
                {/* Add Detail Form */}
                <div className="grid grid-cols-4 gap-2 items-end mb-4">
                  <div>
                    <Label htmlFor="producto">Producto</Label>
                    <Select 
                      value={newDetail.prod_id.toString()} 
                      onValueChange={(value) => setNewDetail({...newDetail, prod_id: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.prod_id} value={product.prod_id.toString()}>
                            {product.prod_nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cantidad">Cantidad</Label>
                    <Input
                      id="cantidad"
                      type="number"
                      min="1"
                      value={newDetail.dec_cantidad}
                      onChange={(e) => setNewDetail({...newDetail, dec_cantidad: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="precio">Precio Unitario</Label>
                    <Input
                      id="precio"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newDetail.dec_precio_unitario}
                      onChange={(e) => setNewDetail({...newDetail, dec_precio_unitario: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <Button 
                    onClick={handleAddDetail}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Details List */}
                {newPurchase.detalles.length > 0 && (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Cantidad</TableHead>
                          <TableHead>Precio Unit.</TableHead>
                          <TableHead>Subtotal</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newPurchase.detalles.map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell>{getProductName(detail.prod_id)}</TableCell>
                            <TableCell>{detail.dec_cantidad}</TableCell>
                            <TableCell>${detail.dec_precio_unitario.toLocaleString()}</TableCell>
                            <TableCell>${(detail.dec_cantidad * detail.dec_precio_unitario).toLocaleString()}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveDetail(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-semibold">Total:</TableCell>
                          <TableCell className="font-semibold">${calculateTotal().toLocaleString()}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleCreatePurchase} 
                disabled={submitting || newPurchase.detalles.length === 0}
                className="bg-pink-600 hover:bg-pink-700"
              >
                {submitting ? "Creando..." : "Crear Compra"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Compras</CardTitle>
          <CardDescription>
            Lista de todas las compras realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Método de Pago</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(purchase.cop_fecha_compra).toLocaleDateString()}</TableCell>
                  <TableCell>{purchase.proveedor}</TableCell>
                  <TableCell className="max-w-xs truncate">{purchase.productos}</TableCell>
                  <TableCell>${purchase.cop_total_compra.toLocaleString()}</TableCell>
                  <TableCell>{purchase.cop_metodo_pago}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        title="Editar compra"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        title="Eliminar compra"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseManagement;