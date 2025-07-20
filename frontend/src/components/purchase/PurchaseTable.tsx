import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

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

interface PurchaseTableProps {
  purchases: Purchase[];
  onEdit: (index: number) => void;
  onDelete: (purchaseId: number) => void;
}

const PurchaseTable = ({ purchases, onEdit, onDelete }: PurchaseTableProps) => {
  return (
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
          <TableRow key={purchase.com_id || index}>
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
                  onClick={() => onEdit(index)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  title="Eliminar compra"
                  onClick={() => onDelete(purchase.com_id || 0)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PurchaseTable;
