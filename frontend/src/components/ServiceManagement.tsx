
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Scissors } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Service {
  ser_id: number;
  ser_nombre: string;
  ser_descripcion: string;
  ser_precio_unitario: number;
  categoria: string;
  duracion_estimada: number; // in minutes
}

const ServiceManagement = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([
    {
      ser_id: 1,
      ser_nombre: "Corte de Cabello Dama",
      ser_descripcion: "Corte profesional para dama con lavado incluido",
      ser_precio_unitario: 25000,
      categoria: "Cabello",
      duracion_estimada: 45
    },
    {
      ser_id: 2,
      ser_nombre: "Corte de Cabello Caballero",
      ser_descripcion: "Corte tradicional o moderno para caballero",
      ser_precio_unitario: 18000,
      categoria: "Cabello",
      duracion_estimada: 30
    },
    {
      ser_id: 3,
      ser_nombre: "Coloración Completa",
      ser_descripcion: "Aplicación de color permanente en todo el cabello",
      ser_precio_unitario: 80000,
      categoria: "Cabello",
      duracion_estimada: 120
    },
    {
      ser_id: 4,
      ser_nombre: "Mechas",
      ser_descripcion: "Aplicación de mechas con papel aluminio",
      ser_precio_unitario: 65000,
      categoria: "Cabello",
      duracion_estimada: 90
    },
    {
      ser_id: 5,
      ser_nombre: "Manicure Tradicional",
      ser_descripcion: "Cuidado completo de uñas con esmaltado",
      ser_precio_unitario: 20000,
      categoria: "Uñas",
      duracion_estimada: 45
    },
    {
      ser_id: 6,
      ser_nombre: "Pedicure Spa",
      ser_descripcion: "Pedicure relajante con exfoliación y masaje",
      ser_precio_unitario: 35000,
      categoria: "Uñas",
      duracion_estimada: 60
    },
    {
      ser_id: 7,
      ser_nombre: "Tratamiento Facial",
      ser_descripcion: "Limpieza facial profunda con mascarilla",
      ser_precio_unitario: 45000,
      categoria: "Facial",
      duracion_estimada: 75
    },
    {
      ser_id: 8,
      ser_nombre: "Depilación Cejas",
      ser_descripcion: "Diseño y depilación profesional de cejas",
      ser_precio_unitario: 15000,
      categoria: "Facial",
      duracion_estimada: 20
    }
  ]);

  const [newService, setNewService] = useState<Partial<Service>>({});
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const categories = ["Cabello", "Uñas", "Facial", "Corporal", "Especiales"];

  const handleAddService = () => {
    if (!newService.ser_nombre || !newService.ser_precio_unitario || !newService.categoria) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const service: Service = {
      ser_id: Math.max(...services.map(s => s.ser_id), 0) + 1,
      ser_nombre: newService.ser_nombre || "",
      ser_descripcion: newService.ser_descripcion || "",
      ser_precio_unitario: newService.ser_precio_unitario || 0,
      categoria: newService.categoria || "",
      duracion_estimada: newService.duracion_estimada || 30
    };

    setServices([...services, service]);
    setNewService({});
    setIsAddingService(false);
    toast({
      title: "Servicio agregado",
      description: "El servicio ha sido agregado exitosamente"
    });
  };

  const handleUpdateService = () => {
    if (!editingService) return;

    setServices(services.map(service => 
      service.ser_id === editingService.ser_id ? editingService : service
    ));
    setEditingService(null);
    toast({
      title: "Servicio actualizado",
      description: "Los datos del servicio han sido actualizados"
    });
  };

  const handleDeleteService = (id: number) => {
    setServices(services.filter(service => service.ser_id !== id));
    toast({
      title: "Servicio eliminado",
      description: "El servicio ha sido eliminado del sistema"
    });
  };

  const getServicesByCategory = (category: string) => {
    return services.filter(service => service.categoria === category);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Cabello": "bg-purple-100 text-purple-700",
      "Uñas": "bg-pink-100 text-pink-700",
      "Facial": "bg-green-100 text-green-700",
      "Corporal": "bg-blue-100 text-blue-700",
      "Especiales": "bg-yellow-100 text-yellow-700"
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  const getAveragePrice = () => {
    if (services.length === 0) return 0;
    return services.reduce((sum, service) => sum + service.ser_precio_unitario, 0) / services.length;
  };

  const getMostExpensiveService = () => {
    if (services.length === 0) return null;
    return services.reduce((max, service) => 
      service.ser_precio_unitario > max.ser_precio_unitario ? service : max
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Servicios</h2>
          <p className="text-gray-600">Administra los servicios del salón</p>
        </div>
        <Dialog open={isAddingService} onOpenChange={setIsAddingService}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Servicio</DialogTitle>
              <DialogDescription>
                Registra un nuevo servicio del salón
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="ser-nombre">Nombre del Servicio *</Label>
                <Input
                  id="ser-nombre"
                  value={newService.ser_nombre || ""}
                  onChange={(e) => setNewService({...newService, ser_nombre: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="ser-descripcion">Descripción</Label>
                <Input
                  id="ser-descripcion"
                  value={newService.ser_descripcion || ""}
                  onChange={(e) => setNewService({...newService, ser_descripcion: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ser-precio">Precio *</Label>
                  <Input
                    id="ser-precio"
                    type="number"
                    value={newService.ser_precio_unitario || ""}
                    onChange={(e) => setNewService({...newService, ser_precio_unitario: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="ser-duracion">Duración (minutos)</Label>
                  <Input
                    id="ser-duracion"
                    type="number"
                    value={newService.duracion_estimada || ""}
                    onChange={(e) => setNewService({...newService, duracion_estimada: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ser-categoria">Categoría *</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newService.categoria || ""}
                  onChange={(e) => setNewService({...newService, categoria: e.target.value})}
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
              <Button onClick={handleAddService}>Agregar Servicio</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Servicios</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">servicios disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getAveragePrice().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">precio promedio</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicio Premium</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${getMostExpensiveService()?.ser_precio_unitario.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {getMostExpensiveService()?.ser_nombre}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {categories.map(category => {
          const categoryServices = getServicesByCategory(category);
          if (categoryServices.length === 0) return null;

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className={getCategoryColor(category)}>
                    {category}
                  </Badge>
                  <span className="text-lg">{categoryServices.length} servicios</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Servicio</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryServices.map((service) => (
                      <TableRow key={service.ser_id}>
                        <TableCell>
                          <div className="font-medium">{service.ser_nombre}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">{service.ser_descripcion}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {service.duracion_estimada} min
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">${service.ser_precio_unitario.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingService(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteService(service.ser_id)}
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
          );
        })}
      </div>

      {editingService && (
        <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Servicio</DialogTitle>
              <DialogDescription>
                Modifica la información del servicio
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="edit-ser-nombre">Nombre del Servicio</Label>
                <Input
                  id="edit-ser-nombre"
                  value={editingService.ser_nombre}
                  onChange={(e) => setEditingService({...editingService, ser_nombre: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-ser-descripcion">Descripción</Label>
                <Input
                  id="edit-ser-descripcion"
                  value={editingService.ser_descripcion}
                  onChange={(e) => setEditingService({...editingService, ser_descripcion: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-ser-precio">Precio</Label>
                  <Input
                    id="edit-ser-precio"
                    type="number"
                    value={editingService.ser_precio_unitario}
                    onChange={(e) => setEditingService({...editingService, ser_precio_unitario: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-ser-duracion">Duración (minutos)</Label>
                  <Input
                    id="edit-ser-duracion"
                    type="number"
                    value={editingService.duracion_estimada}
                    onChange={(e) => setEditingService({...editingService, duracion_estimada: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-ser-categoria">Categoría</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={editingService.categoria}
                  onChange={(e) => setEditingService({...editingService, categoria: e.target.value})}
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
              <Button onClick={handleUpdateService}>Actualizar Servicio</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ServiceManagement;
