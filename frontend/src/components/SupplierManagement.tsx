
import { useState, useEffect } from "react";
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
}

const SupplierManagement = () => {
  const { toast } = useToast();
  // API URL is configured through Docker environment variables
  // Fallback for local development outside Docker
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({});
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Load suppliers when component mounts
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Get authentication token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || null;
  };

  // API function to fetch suppliers
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token && token !== 'null' && token !== 'undefined') {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/suppliers`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.suppliers) {
          setSuppliers(data.suppliers);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.error || "No se pudieron cargar los proveedores",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // API function to create supplier
  const createSupplier = async (supplier: Partial<Supplier>) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token && token !== 'null' && token !== 'undefined') {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/suppliers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prov_nombre: supplier.prov_nombre,
          prov_telefono: supplier.prov_telefono,
          prov_correo: supplier.prov_correo,
          prov_direccion: supplier.prov_direccion,
        }),
      });

      if (response.ok) {
        toast({
          title: "Proveedor creado",
          description: "El proveedor ha sido agregado exitosamente"
        });
        await fetchSuppliers(); // Refresh the list
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.error || "No se pudo crear el proveedor",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
      return false;
    }
  };

  // API function to update supplier
  const updateSupplier = async (supplier: Supplier) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token && token !== 'null' && token !== 'undefined') {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/suppliers/${supplier.prov_id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          prov_nombre: supplier.prov_nombre,
          prov_telefono: supplier.prov_telefono,
          prov_correo: supplier.prov_correo,
          prov_direccion: supplier.prov_direccion,
        }),
      });

      if (response.ok) {
        toast({
          title: "Proveedor actualizado",
          description: "Los datos del proveedor han sido actualizados"
        });
        await fetchSuppliers(); // Refresh the list
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.error || "No se pudo actualizar el proveedor",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      return false;
    }
  };

  // API function to delete supplier
  const deleteSupplier = async (id: number) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token && token !== 'null' && token !== 'undefined') {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/suppliers/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        toast({
          title: "Proveedor eliminado",
          description: "El proveedor ha sido eliminado del sistema"
        });
        await fetchSuppliers(); // Refresh the list
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.error || "No se pudo eliminar el proveedor",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      return false;
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.prov_nombre || !newSupplier.prov_telefono || !newSupplier.prov_correo) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    const success = await createSupplier(newSupplier);
    if (success) {
      setNewSupplier({});
      setIsAddingSupplier(false);
    }
    setSubmitting(false);
  };

  const handleUpdateSupplier = async () => {
    if (!editingSupplier) return;

    setSubmitting(true);
    const success = await updateSupplier(editingSupplier);
    if (success) {
      setEditingSupplier(null);
    }
    setSubmitting(false);
  };

  const handleDeleteSupplier = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      await deleteSupplier(id);
    }
  };

  const getCategoryColor = (index: number) => {
    const colors: string[] = [
      "bg-purple-100 text-purple-700",
      "bg-pink-100 text-pink-700",
      "bg-green-100 text-green-700",
      "bg-blue-100 text-blue-700",
      "bg-yellow-100 text-yellow-700",
      "bg-orange-100 text-orange-700",
      "bg-red-100 text-red-700",
      "bg-gray-100 text-gray-700",
      "bg-indigo-100 text-indigo-700",
      "bg-cyan-100 text-cyan-700",
      "bg-teal-100 text-teal-700",
      "bg-emerald-100 text-emerald-700",
      "bg-lime-100 text-lime-700",
      "bg-amber-100 text-amber-700",
      "bg-rose-100 text-rose-700",
      "bg-violet-100 text-violet-700",
      "bg-sky-100 text-sky-700",
      "bg-slate-100 text-slate-700",
      "bg-zinc-100 text-zinc-700",
      "bg-stone-100 text-stone-700"
    ];
    return colors[index] || "bg-gray-100 text-gray-700";
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
            <Button className="bg-pink-600 hover:bg-pink-700" disabled={loading}>
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
                  disabled={submitting}
                />
              </div>
              <div>
                <Label htmlFor="prov-telefono">Teléfono *</Label>
                <Input
                  id="prov-telefono"
                  value={newSupplier.prov_telefono || ""}
                  onChange={(e) => setNewSupplier({...newSupplier, prov_telefono: e.target.value})}
                  disabled={submitting}
                />
              </div>
              <div>
                <Label htmlFor="prov-correo">Correo Electrónico *</Label>
                <Input
                  id="prov-correo"
                  type="email"
                  value={newSupplier.prov_correo || ""}
                  onChange={(e) => setNewSupplier({...newSupplier, prov_correo: e.target.value})}
                  disabled={submitting}
                />
              </div>
              <div>
                <Label htmlFor="prov-direccion">Dirección</Label>
                <Input
                  id="prov-direccion"
                  value={newSupplier.prov_direccion || ""}
                  onChange={(e) => setNewSupplier({...newSupplier, prov_direccion: e.target.value})}
                  disabled={submitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingSupplier(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={handleAddSupplier} disabled={submitting}>
                {submitting ? "Agregando..." : "Agregar Proveedor"}
              </Button>
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
            <p className="text-xs text-muted-foreground">
              Proveedores registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">
              Todos los proveedores están activos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactos</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.filter(s => s.prov_correo).length}</div>
            <p className="text-xs text-muted-foreground">
              Con correo electrónico
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Proveedores</CardTitle>
          <CardDescription>
            Información de contacto de los proveedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-500">Cargando proveedores...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier, index) => (
                  <TableRow key={supplier.prov_id}>
                    <TableCell>
                      <div className="font-medium">{supplier.prov_nombre}</div>
                      <Badge className={getCategoryColor(index % 6)}>
                        Proveedor #{supplier.prov_id}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {supplier.prov_telefono}
                        </div>
                        {supplier.prov_correo && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {supplier.prov_correo}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {supplier.prov_direccion || "Sin dirección"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingSupplier(supplier)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSupplier(supplier.prov_id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {suppliers.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="text-gray-500">
                        <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No hay proveedores registrados</p>
                        <p className="text-sm">Agrega tu primer proveedor para comenzar</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
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
                <Label htmlFor="edit-prov-nombre">Nombre del Proveedor *</Label>
                <Input
                  id="edit-prov-nombre"
                  value={editingSupplier.prov_nombre}
                  onChange={(e) => setEditingSupplier({...editingSupplier, prov_nombre: e.target.value})}
                  disabled={submitting}
                />
              </div>
              <div>
                <Label htmlFor="edit-prov-telefono">Teléfono *</Label>
                <Input
                  id="edit-prov-telefono"
                  value={editingSupplier.prov_telefono}
                  onChange={(e) => setEditingSupplier({...editingSupplier, prov_telefono: e.target.value})}
                  disabled={submitting}
                />
              </div>
              <div>
                <Label htmlFor="edit-prov-correo">Correo Electrónico *</Label>
                <Input
                  id="edit-prov-correo"
                  type="email"
                  value={editingSupplier.prov_correo}
                  onChange={(e) => setEditingSupplier({...editingSupplier, prov_correo: e.target.value})}
                  disabled={submitting}
                />
              </div>
              <div>
                <Label htmlFor="edit-prov-direccion">Dirección</Label>
                <Input
                  id="edit-prov-direccion"
                  value={editingSupplier.prov_direccion}
                  onChange={(e) => setEditingSupplier({...editingSupplier, prov_direccion: e.target.value})}
                  disabled={submitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSupplier(null)} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateSupplier} disabled={submitting}>
                {submitting ? "Actualizando..." : "Actualizar Proveedor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SupplierManagement;
