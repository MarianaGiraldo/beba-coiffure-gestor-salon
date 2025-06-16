
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Gift, Calendar, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Promotion {
  pro_id: number;
  pro_nombre: string;
  pro_descripcion: string;
  pro_fecha_inicio: string;
  pro_fecha_fin: string;
  pro_descuento_porcentaje: number;
  ser_id: number;
  servicio_nombre: string;
  estado: "Activa" | "Programada" | "Expirada";
  usos: number;
}

const PromotionManagement = () => {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      pro_id: 1,
      pro_nombre: "Descuento Día de la Mujer",
      pro_descripcion: "Descuento especial para celebrar el Día Internacional de la Mujer",
      pro_fecha_inicio: "2024-03-01",
      pro_fecha_fin: "2024-03-08",
      pro_descuento_porcentaje: 20,
      ser_id: 1,
      servicio_nombre: "Corte de Cabello Dama",
      estado: "Expirada",
      usos: 15
    },
    {
      pro_id: 2,
      pro_nombre: "Promo Manicure + Pedicure",
      pro_descripcion: "Combo especial: manicure y pedicure con descuento",
      pro_fecha_inicio: "2024-01-15",
      pro_fecha_fin: "2024-02-29",
      pro_descuento_porcentaje: 15,
      ser_id: 5,
      servicio_nombre: "Manicure Tradicional",
      estado: "Activa",
      usos: 8
    },
    {
      pro_id: 3,
      pro_nombre: "Descuento Coloración Verano",
      pro_descripcion: "Prepárate para el verano con nuestra promoción en coloración",
      pro_fecha_inicio: "2024-02-01",
      pro_fecha_fin: "2024-03-31",
      pro_descuento_porcentaje: 25,
      ser_id: 3,
      servicio_nombre: "Coloración Completa",
      estado: "Activa",
      usos: 12
    },
    {
      pro_id: 4,
      pro_nombre: "Promoción San Valentín",
      pro_descripcion: "Regala belleza en el día del amor y la amistad",
      pro_fecha_inicio: "2024-02-10",
      pro_fecha_fin: "2024-02-14",
      pro_descuento_porcentaje: 30,
      ser_id: 7,
      servicio_nombre: "Tratamiento Facial",
      estado: "Expirada",
      usos: 6
    },
    {
      pro_id: 5,
      pro_nombre: "Descuento Primera Cita",
      pro_descripcion: "Descuento especial para clientes nuevos",
      pro_fecha_inicio: "2024-03-01",
      pro_fecha_fin: "2024-12-31",
      pro_descuento_porcentaje: 10,
      ser_id: 1,
      servicio_nombre: "Corte de Cabello Dama",
      estado: "Programada",
      usos: 0
    }
  ]);

  const [newPromotion, setNewPromotion] = useState<Partial<Promotion>>({});
  const [isAddingPromotion, setIsAddingPromotion] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  // Mock services data
  const services = [
    { ser_id: 1, ser_nombre: "Corte de Cabello Dama" },
    { ser_id: 2, ser_nombre: "Corte de Cabello Caballero" },
    { ser_id: 3, ser_nombre: "Coloración Completa" },
    { ser_id: 4, ser_nombre: "Mechas" },
    { ser_id: 5, ser_nombre: "Manicure Tradicional" },
    { ser_id: 6, ser_nombre: "Pedicure Spa" },
    { ser_id: 7, ser_nombre: "Tratamiento Facial" },
    { ser_id: 8, ser_nombre: "Depilación Cejas" }
  ];

  const getPromotionStatus = (startDate: string, endDate: string): "Activa" | "Programada" | "Expirada" => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (today < start) return "Programada";
    if (today > end) return "Expirada";
    return "Activa";
  };

  const handleAddPromotion = () => {
    if (!newPromotion.pro_nombre || !newPromotion.pro_fecha_inicio || !newPromotion.pro_fecha_fin || !newPromotion.pro_descuento_porcentaje || !newPromotion.ser_id) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const serviceName = services.find(s => s.ser_id === newPromotion.ser_id)?.ser_nombre || "";
    const status = getPromotionStatus(newPromotion.pro_fecha_inicio || "", newPromotion.pro_fecha_fin || "");

    const promotion: Promotion = {
      pro_id: Math.max(...promotions.map(p => p.pro_id), 0) + 1,
      pro_nombre: newPromotion.pro_nombre || "",
      pro_descripcion: newPromotion.pro_descripcion || "",
      pro_fecha_inicio: newPromotion.pro_fecha_inicio || "",
      pro_fecha_fin: newPromotion.pro_fecha_fin || "",
      pro_descuento_porcentaje: newPromotion.pro_descuento_porcentaje || 0,
      ser_id: newPromotion.ser_id || 0,
      servicio_nombre: serviceName,
      estado: status,
      usos: 0
    };

    setPromotions([...promotions, promotion]);
    setNewPromotion({});
    setIsAddingPromotion(false);
    toast({
      title: "Promoción creada",
      description: "La promoción ha sido creada exitosamente"
    });
  };

  const handleUpdatePromotion = () => {
    if (!editingPromotion) return;

    const updatedPromotion = {
      ...editingPromotion,
      estado: getPromotionStatus(editingPromotion.pro_fecha_inicio, editingPromotion.pro_fecha_fin)
    };

    setPromotions(promotions.map(promotion => 
      promotion.pro_id === editingPromotion.pro_id ? updatedPromotion : promotion
    ));
    setEditingPromotion(null);
    toast({
      title: "Promoción actualizada",
      description: "Los datos de la promoción han sido actualizados"
    });
  };

  const handleDeletePromotion = (id: number) => {
    setPromotions(promotions.filter(promotion => promotion.pro_id !== id));
    toast({
      title: "Promoción eliminada",
      description: "La promoción ha sido eliminada del sistema"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activa": return "bg-green-100 text-green-700";
      case "Programada": return "bg-blue-100 text-blue-700";
      case "Expirada": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getActivePromotions = () => {
    return promotions.filter(p => p.estado === "Activa");
  };

  const getTotalSavings = () => {
    // Simulate savings calculation based on promotions used
    return promotions.reduce((total, promo) => {
      // Assuming average service price of 40000 for calculation
      const avgServicePrice = 40000;
      const discount = (avgServicePrice * promo.pro_descuento_porcentaje / 100);
      return total + (discount * promo.usos);
    }, 0);
  };

  const getMostUsedPromotion = () => {
    if (promotions.length === 0) return null;
    return promotions.reduce((max, promo) => 
      promo.usos > max.usos ? promo : max
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Promociones</h2>
          <p className="text-gray-600">Crea y administra promociones para atraer clientes</p>
        </div>
        <Dialog open={isAddingPromotion} onOpenChange={setIsAddingPromotion}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Promoción
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Promoción</DialogTitle>
              <DialogDescription>
                Configura una nueva promoción para los servicios del salón
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="pro-nombre">Nombre de la Promoción *</Label>
                <Input
                  id="pro-nombre"
                  value={newPromotion.pro_nombre || ""}
                  onChange={(e) => setNewPromotion({...newPromotion, pro_nombre: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="pro-descripcion">Descripción</Label>
                <Input
                  id="pro-descripcion"
                  value={newPromotion.pro_descripcion || ""}
                  onChange={(e) => setNewPromotion({...newPromotion, pro_descripcion: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="pro-servicio">Servicio *</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newPromotion.ser_id || ""}
                  onChange={(e) => setNewPromotion({...newPromotion, ser_id: parseInt(e.target.value)})}
                >
                  <option value="">Seleccionar servicio</option>
                  {services.map(service => (
                    <option key={service.ser_id} value={service.ser_id}>
                      {service.ser_nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="pro-descuento">Porcentaje de Descuento *</Label>
                <Input
                  id="pro-descuento"
                  type="number"
                  min="1"
                  max="100"
                  value={newPromotion.pro_descuento_porcentaje || ""}
                  onChange={(e) => setNewPromotion({...newPromotion, pro_descuento_porcentaje: parseFloat(e.target.value)})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pro-inicio">Fecha de Inicio *</Label>
                  <Input
                    id="pro-inicio"
                    type="date"
                    value={newPromotion.pro_fecha_inicio || ""}
                    onChange={(e) => setNewPromotion({...newPromotion, pro_fecha_inicio: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="pro-fin">Fecha de Fin *</Label>
                  <Input
                    id="pro-fin"
                    type="date"
                    value={newPromotion.pro_fecha_fin || ""}
                    onChange={(e) => setNewPromotion({...newPromotion, pro_fecha_fin: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddPromotion}>Crear Promoción</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Promociones</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promotions.length}</div>
            <p className="text-xs text-muted-foreground">promociones creadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promociones Activas</CardTitle>
            <Gift className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getActivePromotions().length}</div>
            <p className="text-xs text-muted-foreground">en funcionamiento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ahorros</CardTitle>
            <Percent className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">${getTotalSavings().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ahorros generados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Más Popular</CardTitle>
            <Gift className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{getMostUsedPromotion()?.usos || 0}</div>
            <p className="text-xs text-muted-foreground truncate">
              {getMostUsedPromotion()?.pro_nombre || "Sin datos"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Promociones</CardTitle>
          <CardDescription>
            Administra todas las promociones del salón
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Promoción</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promotion) => (
                <TableRow key={promotion.pro_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{promotion.pro_nombre}</div>
                      <div className="text-sm text-gray-500 max-w-48 truncate">
                        {promotion.pro_descripcion}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{promotion.servicio_nombre}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Percent className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        {promotion.pro_descuento_porcentaje}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {promotion.pro_fecha_inicio}
                      </div>
                      <div className="text-gray-500">
                        hasta {promotion.pro_fecha_fin}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(promotion.estado)}>
                      {promotion.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{promotion.usos} veces</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPromotion(promotion)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePromotion(promotion.pro_id)}
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

      {editingPromotion && (
        <Dialog open={!!editingPromotion} onOpenChange={() => setEditingPromotion(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Promoción</DialogTitle>
              <DialogDescription>
                Modifica los datos de la promoción
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="edit-pro-nombre">Nombre de la Promoción</Label>
                <Input
                  id="edit-pro-nombre"
                  value={editingPromotion.pro_nombre}
                  onChange={(e) => setEditingPromotion({...editingPromotion, pro_nombre: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-pro-descripcion">Descripción</Label>
                <Input
                  id="edit-pro-descripcion"
                  value={editingPromotion.pro_descripcion}
                  onChange={(e) => setEditingPromotion({...editingPromotion, pro_descripcion: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-pro-servicio">Servicio</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={editingPromotion.ser_id}
                  onChange={(e) => setEditingPromotion({...editingPromotion, ser_id: parseInt(e.target.value)})}
                >
                  {services.map(service => (
                    <option key={service.ser_id} value={service.ser_id}>
                      {service.ser_nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-pro-descuento">Porcentaje de Descuento</Label>
                <Input
                  id="edit-pro-descuento"
                  type="number"
                  min="1"
                  max="100"
                  value={editingPromotion.pro_descuento_porcentaje}
                  onChange={(e) => setEditingPromotion({...editingPromotion, pro_descuento_porcentaje: parseFloat(e.target.value)})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-pro-inicio">Fecha de Inicio</Label>
                  <Input
                    id="edit-pro-inicio"
                    type="date"
                    value={editingPromotion.pro_fecha_inicio}
                    onChange={(e) => setEditingPromotion({...editingPromotion, pro_fecha_inicio: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-pro-fin">Fecha de Fin</Label>
                  <Input
                    id="edit-pro-fin"
                    type="date"
                    value={editingPromotion.pro_fecha_fin}
                    onChange={(e) => setEditingPromotion({...editingPromotion, pro_fecha_fin: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdatePromotion}>Actualizar Promoción</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PromotionManagement;
