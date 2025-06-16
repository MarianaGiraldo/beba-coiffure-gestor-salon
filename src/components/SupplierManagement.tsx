
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Truck, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  prov_id: number;
  prov_nombre: string;
  prov_telefono: string;
  prov_correo: string;
  prov_direccion: string;
  categoria: string;
  estado: "Activo" | "Inactivo";
}

const SupplierManagement = () => {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      prov_id: 1,
      prov_nombre: "Distribuidora Beauty Pro",
      prov_telefono: "3201234567",
      prov_correo: "ventas@beautypro.com",
      prov_direccion: "Calle 45 #23-12, Barranquilla",
      categoria: "Productos Capilares",
      estado: "Activo"
    },
    {
      prov_id: 2,
      prov_nombre: "Suministros Estética",
      prov_telefono: "3009876543",
      prov_correo: "pedidos@suministrosestetica.com",
      prov_direccion: "Carrera 50 #30-45, Barranquilla",
      categoria: "Productos de Uñas",
      estado: "Activo"
    },
    {
      prov_id: 3,
      prov_nombre: "Cosmética Profesional SAS",
      prov_telefono: "3155432109",
      prov_correo: "info@cosmeticaprofesional.com",
      prov_direccion: "Av. Murillo #78-34, Barranquilla",
      categoria: "Cosméticos Faciales",
      estado: "Activo"
    },
    {
      prov_id: 4,
      prov_nombre: "Equipos Belleza Total",
      prov_telefono: "3007891234",
      prov_correo: "contacto@equiposbellatotal.com",
      prov_direccion: "Calle 84 #52-67, Barranquilla",
      categoria: "Equipos y Herramientas",
      estado: "Inactivo"
    }
  ]);

  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({});
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const categories = [
    "Productos Capilares",
    "Productos de Uñas",
    "Cosméticos Faciales",
    "Equipos y Herramientas",
    "Productos de Limpieza",
    "Consumibles"
  ];

  const handleAddSupplier = () => {
    if (!newSupplier.prov_nombre || !newSupplier.prov_telefono || !newSupplier.categoria) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const supplier: Supplier = {
      prov_id: Math.max(...suppliers.map(s => s.prov_id), 0) + 1,
      prov_nombre: newSupplier.prov_nombre || "",
      prov_telefono: newSupplier.prov_telefono || "",
      prov_correo: newSupplier.prov_correo || "",
      prov_direccion: newSupplier.prov_direccion || "",
      categoria: newSupplier.categoria || "",
      estado: "Activo"
    };

    setSuppliers([...suppliers, supplier]);
    setNewSupplier({});
    setIsAddingSupplier(false);
    toast({
      title: "Proveedor agregado",
      description: "El proveedor ha sido agregado exitosamente"
    });
  };

  const handleUpdateSupplier = () => {
    if (!editingSupplier) return;

    setSuppliers(suppliers.map(supplier => 
      supplier.prov_id === editingSupplier.prov_id ? editingSupplier : supplier
    ));
    setEditingSupplier(null);
    toast({
      title: "Proveedor actualizado",
      description: "Los datos del proveedor han sido actualizados"
    });
  };

  const handleDeleteSupplier = (id: number) => {
    setSuppliers(suppliers.filter(supplier => supplier.prov_id !== id));
    toast({
      title: "Proveedor eliminado",
      description: "El proveedor ha sido eliminado del sistema"
    });
  };

  const toggleSupplierStatus = (id: number) => {
    setSuppliers(suppliers.map(supplier => 
      supplier.prov_id === id 
        ? { ...supplier, estado: supplier.estado === "Activo" ? "Inactivo" : "Activo" }
        : supplier
    ));
    toast({
      title: "Estado actualizado",
      description: "El estado del proveedor ha sido actualizado"
    });
  };

  const getStatusColor = (status: string) => {
    return status === "Activo" 
      ? "bg-green-100 text-green-700" 
      : "bg-red-100 text-red-700";
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Productos Capilares": "bg-purple-100 text-purple-700",
      "Productos de Uñas": "bg-pink-100 text-pink-700",
      "Cosméticos Faciales": "bg-green-100 text-green-700",
      "Equipos y Herramientas": "bg-blue-100 text-blue-700",
      "Productos de Limpieza": "bg-yellow-100 text-yellow-700",
      "Consumibles": "bg-gray-100 text-gray-700"
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  const getActiveSuppliers = () => {
    return suppliers.filter(s => s.estado === "Activo");
  };

  const getSuppliersByCategory = () => {
    const categoryCount: { [key: string]: number } = {};
    suppliers.forEach(supplier => {
      if (supplier.estado === "Activo") {
        categoryCount[supplier.categoria] = (categoryCount[supplier.categoria] || 0) + 1;
      }
    });
    return categoryCount;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Proveedores</h2>
          <p className="text-gray-600">Administra proveedores y contactos comerciales</p>
        </div>
        <Dialog open={isAddingSupplier} onOpenChange={setIsAddingSupplier}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Proveedor</DialogTitle>
              <DialogDescription>
                Registra un nuevo proveedor en el sistema
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="prov-nombre">Nombre del Proveedor *</Label>
                <Input
                  id="prov-nombre"
                  value={newSupplier.prov_nombre || ""}
                  onChange={(e) => setNewSupplier({...newSupplier, prov_nombre: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prov-telefono">Teléfono *</Label>
                  <Input
                    id="prov-telefono"
                    value={newSupplier.prov_telefono || ""}
                    onChange={(e) => setNewSupplier({...newSupplier, prov_telefono: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="prov-correo">Correo Electrónico</Label>
                  <Input
                    id="prov-correo"
                    type="email"
                    value={newSupplier.prov_correo || ""}
                    onChange={(e) => setNewSupplier({...newSupplier, prov_correo: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="prov-direccion">Dirección</Label>
                <Input
                  id="prov-direccion"
                  value={newSupplier.prov_direccion || ""}
                  onChange={(e) => setNewSupplier({...newSupplier, prov_direccion: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="prov-categoria">Categoría *</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newSupplier.categoria || ""}
                  onChange={(e) => setNewSupplier({...newSupplier, categoria: e.target.value})}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddSupplier}>Agregar Proveedor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">proveedores registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getActiveSuppliers().length}</div>
            <p className="text-xs text-muted-foreground">en operación</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(getSuppliersByCategory()).length}</div>
            <p className="text-xs text-muted-foreground">categorías disponibles</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Proveedores</CardTitle>
          <CardDescription>
            Información de contacto y estado de los proveedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.prov_id}>
                  <TableCell>
                    <div className="font-medium">{supplier.prov_nombre}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(supplier.categoria)}>
                      {supplier.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3" />
                        {supplier.prov_telefono}
                      </div>
                      {supplier.prov_correo && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="h-3 w-3" />
                          {supplier.prov_correo}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500 max-w-32 truncate">
                      {supplier.prov_direccion}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(supplier.estado)}>
                      {supplier.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingSupplier(supplier)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleSupplierStatus(supplier.prov_id)}
                      >
                        {supplier.estado === "Activo" ? "Desactivar" : "Activar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSupplier(supplier.prov_id)}
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

      {editingSupplier && (
        <Dialog open={!!editingSupplier} onOpenChange={() => setEditingSupplier(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Proveedor</DialogTitle>
              <DialogDescription>
                Modifica la información del proveedor
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="edit-prov-nombre">Nombre del Proveedor</Label>
                <Input
                  id="edit-prov-nombre"
                  value={editingSupplier.prov_nombre}
                  onChange={(e) => setEditingSupplier({...editingSupplier, prov_nombre: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-prov-telefono">Teléfono</Label>
                  <Input
                    id="edit-prov-telefono"
                    value={editingSupplier.prov_telefono}
                    onChange={(e) => setEditingSupplier({...editingSupplier, prov_telefono: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-prov-correo">Correo Electrónico</Label>
                  <Input
                    id="edit-prov-correo"
                    type="email"
                    value={editingSupplier.prov_correo}
                    onChange={(e) => setEditingSupplier({...editingSupplier, prov_correo: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-prov-direccion">Dirección</Label>
                <Input
                  id="edit-prov-direccion"
                  value={editingSupplier.prov_direccion}
                  onChange={(e) => setEditingSupplier({...editingSupplier, prov_direccion: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-prov-categoria">Categoría</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={editingSupplier.categoria}
                  onChange={(e) => setEditingSupplier({...editingSupplier, categoria: e.target.value})}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateSupplier}>Actualizar Proveedor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SupplierManagement;
