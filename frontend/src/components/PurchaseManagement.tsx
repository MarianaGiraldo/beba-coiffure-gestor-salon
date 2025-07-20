import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CreatePurchaseForm from "./purchase/CreatePurchaseForm";
import EditPurchaseForm from "./purchase/EditPurchaseForm";
import DeleteConfirmationDialog from "./purchase/DeleteConfirmationDialog";
import PurchaseTable from "./purchase/PurchaseTable";

interface Purchase {
  com_id?: number;
  cop_fecha_compra: string;
  proveedor: string;
  productos: string;
  cop_total_compra: number;
  cop_metodo_pago: string;
  prov_id?: number;
  gas_id?: number;
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

interface UpdatePurchaseRequest {
  cop_fecha_compra: string;
  prov_id: number;
  gas_id: number;
  cop_metodo_pago: string;
}

interface PurchaseWithDetails {
  com_id: number;
  cop_fecha_compra: string;
  cop_total_compra: number;
  cop_metodo_pago: string;
  prov_id: number;
  gas_id: number;
  proveedor: string;
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

  // Edit state
  const [isEditingPurchase, setIsEditingPurchase] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<PurchaseWithDetails | null>(null);
  const [editPurchaseData, setEditPurchaseData] = useState<UpdatePurchaseRequest>({
    cop_fecha_compra: '',
    prov_id: 0,
    gas_id: 0,
    cop_metodo_pago: ''
  });

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<number | null>(null);
  const [showDeleteDetailConfirm, setShowDeleteDetailConfirm] = useState(false);
  const [detailToDelete, setDetailToDelete] = useState<{purchaseId: number, prodId: number} | null>(null);

  // New purchase form state
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

    setNewDetail({
      prod_id: 0,
      dec_cantidad: 1,
      dec_precio_unitario: 0
    });
  };

  const handleCreatePurchase = async (purchase: CreatePurchaseRequest) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/purchases`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchase),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchPurchases();
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
      throw error;
    }
  };

  const getProductName = (prodId: number) => {
    const product = products.find(p => p.prod_id === prodId);
    return product ? product.prod_nombre : `Producto #${prodId}`;
  };

  const calculateEditTotal = (details: PurchaseDetail[]) => {
    return details.reduce((total, detail) => 
      total + (detail.dec_cantidad * detail.dec_precio_unitario), 0
    );
  };

  // Fetch purchase details for editing
  const fetchPurchaseDetails = async (purchaseId: number) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/purchases/${purchaseId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.purchase;
    } catch (error) {
      console.error('Error fetching purchase details:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la compra",
        variant: "destructive"
      });
      return null;
    }
  };

  // Handle edit purchase
  const handleEditPurchase = async (purchaseIndex: number) => {
    const purchase = purchases[purchaseIndex];
    if (!purchase.com_id) {
      toast({
        title: "Error",
        description: "ID de compra no encontrado",
        variant: "destructive"
      });
      return;
    }

    const purchaseDetails = await fetchPurchaseDetails(purchase.com_id);
    if (purchaseDetails) {
      setEditingPurchase(purchaseDetails);
      setEditPurchaseData({
        cop_fecha_compra: purchaseDetails.cop_fecha_compra.split('T')[0],
        prov_id: purchaseDetails.prov_id,
        gas_id: purchaseDetails.gas_id,
        cop_metodo_pago: purchaseDetails.cop_metodo_pago
      });
      setIsEditingPurchase(true);
    }
  };

  // Update purchase
  const handleUpdatePurchase = async (purchaseData: UpdatePurchaseRequest) => {
    if (!editingPurchase) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/purchases/${editingPurchase.com_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchPurchases();
      setIsEditingPurchase(false);
      setEditingPurchase(null);

      toast({
        title: "Compra actualizada",
        description: "La compra ha sido actualizada exitosamente"
      });
    } catch (error: any) {
      console.error('Error updating purchase:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la compra",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Update purchase detail
  const handleUpdatePurchaseDetail = async (detailIndex: number, updatedDetail: PurchaseDetail) => {
    if (!editingPurchase) return;

    setSubmitting(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/purchases/${editingPurchase.com_id}/details/${updatedDetail.prod_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDetail),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Update local state
      const updatedDetails = [...editingPurchase.detalles];
      updatedDetails[detailIndex] = updatedDetail;
      setEditingPurchase({
        ...editingPurchase,
        detalles: updatedDetails,
        cop_total_compra: calculateEditTotal(updatedDetails)
      });

      toast({
        title: "Detalle actualizado",
        description: "El detalle de la compra ha sido actualizado"
      });
    } catch (error: any) {
      console.error('Error updating purchase detail:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el detalle",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Add new detail to existing purchase
  const handleAddPurchaseDetail = async (purchaseId: number, newDetail: PurchaseDetail) => {
    setSubmitting(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/purchases/${purchaseId}/details`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDetail),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Update local state
      if (editingPurchase && editingPurchase.com_id === purchaseId) {
        const updatedDetails = [...editingPurchase.detalles, newDetail];
        setEditingPurchase({
          ...editingPurchase,
          detalles: updatedDetails,
          cop_total_compra: calculateEditTotal(updatedDetails)
        });
      }

      toast({
        title: "Detalle agregado",
        description: "El nuevo detalle ha sido agregado a la compra"
      });
    } catch (error: any) {
      console.error('Error adding purchase detail:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el detalle",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // Delete purchase
  const handleDeletePurchase = async () => {
    if (!purchaseToDelete) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/purchases/${purchaseToDelete}`, {
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

      await fetchPurchases();
      setShowDeleteConfirm(false);
      setPurchaseToDelete(null);

      toast({
        title: "Compra eliminada",
        description: "La compra ha sido eliminada exitosamente"
      });
    } catch (error: any) {
      console.error('Error deleting purchase:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la compra",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Delete purchase detail
  const handleDeletePurchaseDetail = async () => {
    if (!detailToDelete || !editingPurchase) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/purchases/${detailToDelete.purchaseId}/details/${detailToDelete.prodId}`, {
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

      // Update local state
      const updatedDetails = editingPurchase.detalles.filter(detail => detail.prod_id !== detailToDelete.prodId);
      setEditingPurchase({
        ...editingPurchase,
        detalles: updatedDetails,
        cop_total_compra: calculateEditTotal(updatedDetails)
      });

      setShowDeleteDetailConfirm(false);
      setDetailToDelete(null);

      toast({
        title: "Detalle eliminado",
        description: "El detalle de la compra ha sido eliminado"
      });
    } catch (error: any) {
      console.error('Error deleting purchase detail:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el detalle",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleDeleteDetailConfirm = (purchaseId: number, prodId: number) => {
    setDetailToDelete({ purchaseId, prodId });
    setShowDeleteDetailConfirm(true);
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
        <Button 
          className="bg-pink-600 hover:bg-pink-700"
          onClick={() => setIsCreatingPurchase(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Compra
        </Button>
      </div>

      {/* Create Purchase Form */}
      <CreatePurchaseForm
        open={isCreatingPurchase}
        onOpenChange={setIsCreatingPurchase}
        suppliers={suppliers}
        expenses={expenses}
        products={products}
        onSubmit={handleCreatePurchase}
        submitting={submitting}
      />

      {/* Edit Purchase Form */}
      <EditPurchaseForm
        open={isEditingPurchase}
        onOpenChange={setIsEditingPurchase}
        purchase={editingPurchase}
        suppliers={suppliers}
        expenses={expenses}
        products={products}
        onSubmit={handleUpdatePurchase}
        onUpdateDetail={handleUpdatePurchaseDetail}
        onDeleteDetail={handleDeleteDetailConfirm}
        onAddDetail={handleAddPurchaseDetail}
        submitting={submitting}
      />

      {/* Delete Purchase Confirmation */}
      <DeleteConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Confirmar Eliminación"
        description="¿Estás seguro de que deseas eliminar esta compra? Esta acción no se puede deshacer."
        onConfirm={handleDeletePurchase}
        submitting={submitting}
      />

      {/* Delete Purchase Detail Confirmation */}
      <DeleteConfirmationDialog
        open={showDeleteDetailConfirm}
        onOpenChange={setShowDeleteDetailConfirm}
        title="Confirmar Eliminación"
        description="¿Estás seguro de que deseas eliminar este detalle de la compra? Esta acción no se puede deshacer."
        onConfirm={handleDeletePurchaseDetail}
        submitting={submitting}
      />

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Compras</CardTitle>
          <CardDescription>
            Lista de todas las compras realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PurchaseTable
            purchases={purchases}
            onEdit={handleEditPurchase}
            onDelete={(purchaseId) => {
              setPurchaseToDelete(purchaseId);
              setShowDeleteConfirm(true);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseManagement;