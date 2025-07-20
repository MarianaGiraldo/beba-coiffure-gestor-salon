import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus } from "lucide-react";

interface PurchaseDetail {
  prod_id: number;
  dec_cantidad: number;
  dec_precio_unitario: number;
}

interface UpdatePurchaseRequest {
  cop_fecha_compra: string;
  prov_id: number;
  gas_id: number;
  cop_metodo_pago: string;
  cop_total_compra: number;
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

interface EditPurchaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase: PurchaseWithDetails | null;
  suppliers: Supplier[];
  expenses: Expense[];
  products: Product[];
  onSubmit: (purchaseData: UpdatePurchaseRequest) => Promise<void>;
  onUpdateDetail: (detailIndex: number, detail: PurchaseDetail) => Promise<void>;
  onDeleteDetail: (purchaseId: number, prodId: number) => void;
  onAddDetail: (purchaseId: number, detail: PurchaseDetail) => Promise<void>;
  submitting: boolean;
}

// Editable Detail Row Component
const EditableDetailRow = ({ 
  detail, 
  products, 
  onUpdate, 
  onDelete 
}: {
  detail: PurchaseDetail;
  products: Product[];
  onUpdate: (detail: PurchaseDetail) => void;
  onDelete: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetail, setEditedDetail] = useState<PurchaseDetail>(detail);

  const getProductName = (prodId: number) => {
    const product = products.find(p => p.prod_id === prodId);
    return product ? product.prod_nombre : `Producto #${prodId}`;
  };

  const handleSave = () => {
    onUpdate(editedDetail);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDetail(detail);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <TableRow>
        <TableCell>{getProductName(detail.prod_id)}</TableCell>
        <TableCell>
          <Input
            type="number"
            min="1"
            value={editedDetail.dec_cantidad}
            onChange={(e) => setEditedDetail({...editedDetail, dec_cantidad: parseInt(e.target.value) || 1})}
            className="w-20"
          />
        </TableCell>
        <TableCell>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={editedDetail.dec_precio_unitario}
            onChange={(e) => setEditedDetail({...editedDetail, dec_precio_unitario: parseFloat(e.target.value) || 0})}
            className="w-24"
          />
        </TableCell>
        <TableCell>${(editedDetail.dec_cantidad * editedDetail.dec_precio_unitario).toLocaleString()}</TableCell>
        <TableCell>
          <div className="flex space-x-1">
            <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              ✓
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              ✕
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>{getProductName(detail.prod_id)}</TableCell>
      <TableCell>{detail.dec_cantidad}</TableCell>
      <TableCell>${detail.dec_precio_unitario.toLocaleString()}</TableCell>
      <TableCell>${(detail.dec_cantidad * detail.dec_precio_unitario).toLocaleString()}</TableCell>
      <TableCell>
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
            title="Editar detalle"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={onDelete}
            title="Eliminar detalle"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const EditPurchaseForm = ({
  open,
  onOpenChange,
  purchase,
  suppliers,
  expenses,
  products,
  onSubmit,
  onUpdateDetail,
  onDeleteDetail,
  onAddDetail,
  submitting
}: EditPurchaseFormProps) => {
  const [editPurchaseData, setEditPurchaseData] = useState<UpdatePurchaseRequest>({
    cop_fecha_compra: '',
    prov_id: 0,
    gas_id: 0,
    cop_metodo_pago: '',
    cop_total_compra: 0
  });

  // State for adding new details
  const [newDetail, setNewDetail] = useState<PurchaseDetail>({
    prod_id: 0,
    dec_cantidad: 1,
    dec_precio_unitario: 0
  });
  const [showAddDetail, setShowAddDetail] = useState(false);

  // Update form data when purchase changes
  useEffect(() => {
    if (purchase) {
      setEditPurchaseData({
        cop_fecha_compra: purchase.cop_fecha_compra.split('T')[0],
        prov_id: purchase.prov_id,
        gas_id: purchase.gas_id,
        cop_metodo_pago: purchase.cop_metodo_pago,
        cop_total_compra: purchase.cop_total_compra
      });
    }
  }, [purchase]);

  // Reset new detail form when dialog opens
  useEffect(() => {
    if (open) {
      setNewDetail({
        prod_id: 0,
        dec_cantidad: 1,
        dec_precio_unitario: 0
      });
      setShowAddDetail(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    await onSubmit(editPurchaseData);
  };

  const handleUpdateDetail = async (detailIndex: number, updatedDetail: PurchaseDetail) => {
    await onUpdateDetail(detailIndex, updatedDetail);
  };

  const handleDeleteDetail = (prodId: number) => {
    if (purchase) {
      onDeleteDetail(purchase.com_id, prodId);
    }
  };

  const handleAddNewDetail = async () => {
    if (purchase && newDetail.prod_id > 0) {
      await onAddDetail(purchase.com_id, newDetail);
      setNewDetail({
        prod_id: 0,
        dec_cantidad: 1,
        dec_precio_unitario: 0
      });
      setShowAddDetail(false);
    }
  };

  const handleProductChange = (prodId: string) => {
    const selectedProduct = products.find(p => p.prod_id === parseInt(prodId));
    setNewDetail({
      ...newDetail,
      prod_id: parseInt(prodId),
      dec_precio_unitario: selectedProduct ? selectedProduct.prod_precio_unitario : 0
    });
  };

  const getAvailableProducts = () => {
    if (!purchase) return products;
    const usedProductIds = purchase.detalles.map(d => d.prod_id);
    return products.filter(p => !usedProductIds.includes(p.prod_id));
  };

  if (!purchase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Compra</DialogTitle>
          <DialogDescription>
            Modifica los datos de la compra y sus detalles
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-fecha">Fecha de Compra *</Label>
              <Input
                id="edit-fecha"
                type="date"
                value={editPurchaseData.cop_fecha_compra}
                onChange={(e) => setEditPurchaseData({...editPurchaseData, cop_fecha_compra: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-metodo-pago">Método de Pago *</Label>
              <Select 
                value={editPurchaseData.cop_metodo_pago} 
                onValueChange={(value) => setEditPurchaseData({...editPurchaseData, cop_metodo_pago: value})}
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
              <Label htmlFor="edit-proveedor">Proveedor *</Label>
              <Select 
                value={editPurchaseData.prov_id.toString()} 
                onValueChange={(value) => setEditPurchaseData({...editPurchaseData, prov_id: parseInt(value)})}
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
              <Label htmlFor="edit-gasto">Gasto Asociado *</Label>
              <Select 
                value={editPurchaseData.gas_id.toString()} 
                onValueChange={(value) => setEditPurchaseData({...editPurchaseData, gas_id: parseInt(value)})}
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalles de Compra</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddDetail(!showAddDetail)}
                className="text-green-600 hover:text-green-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar Detalle
              </Button>
            </div>

            {/* Add New Detail Form */}
            {showAddDetail && (
              <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                <h4 className="text-md font-medium mb-3">Nuevo Detalle</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="new-product">Producto *</Label>
                    <Select 
                      value={newDetail.prod_id.toString()} 
                      onValueChange={handleProductChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableProducts().map((product) => (
                          <SelectItem key={product.prod_id} value={product.prod_id.toString()}>
                            {product.prod_nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="new-cantidad">Cantidad *</Label>
                    <Input
                      id="new-cantidad"
                      type="number"
                      min="1"
                      value={newDetail.dec_cantidad}
                      onChange={(e) => setNewDetail({...newDetail, dec_cantidad: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-precio">Precio Unitario *</Label>
                    <Input
                      id="new-precio"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newDetail.dec_precio_unitario}
                      onChange={(e) => setNewDetail({...newDetail, dec_precio_unitario: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddNewDetail}
                      disabled={newDetail.prod_id === 0 || newDetail.dec_cantidad <= 0 || newDetail.dec_precio_unitario <= 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Agregar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddDetail(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
                {newDetail.prod_id > 0 && newDetail.dec_cantidad > 0 && newDetail.dec_precio_unitario > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Subtotal: ${(newDetail.dec_cantidad * newDetail.dec_precio_unitario).toLocaleString()}
                  </div>
                )}
              </div>
            )}
            
            {/* Details List */}
            {purchase.detalles.length > 0 && (
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
                    {purchase.detalles.map((detail, index) => (
                      <EditableDetailRow
                        key={`${detail.prod_id}-${index}`}
                        detail={detail}
                        products={products}
                        onUpdate={(updatedDetail) => handleUpdateDetail(index, updatedDetail)}
                        onDelete={() => handleDeleteDetail(detail.prod_id)}
                      />
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-semibold">Total:</TableCell>
                      <TableCell className="font-semibold">${purchase.cop_total_compra.toLocaleString()}</TableCell>
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
            onClick={handleSubmit} 
            disabled={submitting}
            className="bg-pink-600 hover:bg-pink-700"
          >
            {submitting ? "Actualizando..." : "Actualizar Compra"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPurchaseForm;
