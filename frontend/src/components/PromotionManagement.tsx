
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Gift, Calendar, Percent, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Promotion {
  pro_id: number;
  pro_nombre: string;
  pro_descripcion: string;
  pro_fecha_inicio: string;
  pro_fecha_fin: string;
  pro_descuento_porcentaje: number;
  pro_usos: number;
  ser_nombre: string;
}

interface Service {
  ser_id: number;
  ser_nombre: string;
  ser_descripcion?: string;
  ser_categoria: string;
  ser_precio_unitario: number;
  ser_duracion_estimada?: number;
}

const PromotionManagement = () => {
  const { toast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [newPromotion, setNewPromotion] = useState<Partial<Promotion & { ser_id: number }>>({});
  const [isAddingPromotion, setIsAddingPromotion] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<(Promotion & { ser_id?: number }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load promotions and services when component mounts
  useEffect(() => {
    fetchPromotions();
    fetchServices();
  }, []);

  // Get authentication token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || null;
  };

  // API function to fetch promotions
  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/promotions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPromotions(data.promotions || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las promociones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // API function to fetch services
  const fetchServices = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/services`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los servicios",
        variant: "destructive"
      });
    }
  };

  // API function to create promotion
  const createPromotion = async (promotion: any) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(promotion),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  };

  // API function to update promotion
  const updatePromotion = async (id: number, promotion: any) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/promotions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(promotion),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  };

  // API function to delete promotion
  const deletePromotion = async (id: number) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/promotions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  };

  // Function to determine promotion status based on current date (UTC-5)
  const getPromotionStatus = (startDate: string, endDate: string): "Activa" | "Programada" | "Expirada" => {
    // Create date in UTC-5 timezone (Colombia/Bogota)
    const now = new Date();
    const today = new Date(now.getTime());
    
    const start = new Date(startDate );
    const end = new Date(endDate );
    console.log("Start:", startDate, start, "End:", endDate, end, "Today:", today);
    if (today < start) return "Programada";
    if (today > end) return "Expirada";
    return "Activa";
  };

  const handleAddPromotion = async () => {
    if (!newPromotion.pro_nombre || !newPromotion.pro_fecha_inicio || !newPromotion.pro_fecha_fin || 
        !newPromotion.pro_descuento_porcentaje || !newPromotion.ser_id) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    // Validate dates
    if (newPromotion.pro_fecha_inicio! >= newPromotion.pro_fecha_fin!) {
      toast({
        title: "Error",
        description: "La fecha de inicio debe ser anterior a la fecha de fin",
        variant: "destructive"
      });
      return;
    }

    // Validate discount percentage
    if (newPromotion.pro_descuento_porcentaje! < 0 || newPromotion.pro_descuento_porcentaje! > 100) {
      toast({
        title: "Error",
        description: "El porcentaje de descuento debe estar entre 0 y 100",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      await createPromotion({
        pro_nombre: newPromotion.pro_nombre,
        pro_descripcion: newPromotion.pro_descripcion || "",
        pro_fecha_inicio: newPromotion.pro_fecha_inicio,
        pro_fecha_fin: newPromotion.pro_fecha_fin,
        pro_descuento_porcentaje: newPromotion.pro_descuento_porcentaje,
        ser_id: newPromotion.ser_id,
        pro_usos: newPromotion.pro_usos || 0
      });

      await fetchPromotions(); // Refresh the list
      setNewPromotion({});
      setIsAddingPromotion(false);
      toast({
        title: "Promoción creada",
        description: "La promoción ha sido creada exitosamente"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la promoción",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePromotion = async () => {
    if (!editingPromotion) return;

    // Validate required fields
    if (!editingPromotion.pro_nombre || !editingPromotion.pro_fecha_inicio || !editingPromotion.pro_fecha_fin || 
        !editingPromotion.pro_descuento_porcentaje || !editingPromotion.ser_id) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    // Validate dates
    if (editingPromotion.pro_fecha_inicio >= editingPromotion.pro_fecha_fin) {
      toast({
        title: "Error",
        description: "La fecha de inicio debe ser anterior a la fecha de fin",
        variant: "destructive"
      });
      return;
    }

    // Validate discount percentage
    if (editingPromotion.pro_descuento_porcentaje < 0 || editingPromotion.pro_descuento_porcentaje > 100) {
      toast({
        title: "Error",
        description: "El porcentaje de descuento debe estar entre 0 y 100",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      await updatePromotion(editingPromotion.pro_id, {
        pro_nombre: editingPromotion.pro_nombre,
        pro_descripcion: editingPromotion.pro_descripcion || "",
        pro_fecha_inicio: editingPromotion.pro_fecha_inicio,
        pro_fecha_fin: editingPromotion.pro_fecha_fin,
        pro_descuento_porcentaje: editingPromotion.pro_descuento_porcentaje,
        ser_id: editingPromotion.ser_id,
        pro_usos: editingPromotion.pro_usos || 0
      });

      await fetchPromotions(); // Refresh the list
      setEditingPromotion(null);
      toast({
        title: "Promoción actualizada",
        description: "Los datos de la promoción han sido actualizados"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la promoción",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePromotion = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta promoción?')) {
      try {
        await deletePromotion(id);
        await fetchPromotions(); // Refresh the list
        toast({
          title: "Promoción eliminada",
          description: "La promoción ha sido eliminada del sistema"
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "No se pudo eliminar la promoción",
          variant: "destructive"
        });
      }
    }
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
    return promotions.filter(p => getPromotionStatus(p.pro_fecha_inicio, p.pro_fecha_fin) === "Activa");
  };

  const getTotalSavings = () => {
    // Simulate savings calculation based on promotions used
    return promotions.reduce((total, promo) => {
      // Assuming average service price of 40000 for calculation
      const avgServicePrice = 40000;
      const discount = (avgServicePrice * promo.pro_descuento_porcentaje / 100);
      return total + (discount * promo.pro_usos);
    }, 0);
  };

  const getMostUsedPromotion = () => {
    if (promotions.length === 0) return null;
    return promotions.reduce((max, promo) => 
      promo.pro_usos > max.pro_usos ? promo : max
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Promociones</h1>
          <p className="text-muted-foreground">Administra las promociones y descuentos del salón</p>
        </div>
        <Dialog open={isAddingPromotion} onOpenChange={setIsAddingPromotion}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Promoción
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Promoción</DialogTitle>
              <DialogDescription>
                Completa la información para crear una nueva promoción.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="pro_nombre">Nombre de la Promoción</Label>
                <Input
                  id="pro_nombre"
                  value={newPromotion.pro_nombre || ""}
                  onChange={(e) => setNewPromotion({...newPromotion, pro_nombre: e.target.value})}
                  placeholder="Ej: Descuento Día de la Madre"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pro_descripcion">Descripción</Label>
                <Textarea
                  id="pro_descripcion"
                  value={newPromotion.pro_descripcion || ""}
                  onChange={(e) => setNewPromotion({...newPromotion, pro_descripcion: e.target.value})}
                  placeholder="Descripción de la promoción..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="pro_fecha_inicio">Fecha de Inicio</Label>
                  <Input
                    id="pro_fecha_inicio"
                    type="date"
                    value={newPromotion.pro_fecha_inicio || ""}
                    onChange={(e) => setNewPromotion({...newPromotion, pro_fecha_inicio: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pro_fecha_fin">Fecha de Fin</Label>
                  <Input
                    id="pro_fecha_fin"
                    type="date"
                    value={newPromotion.pro_fecha_fin || ""}
                    onChange={(e) => setNewPromotion({...newPromotion, pro_fecha_fin: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="pro_descuento_porcentaje">Descuento (%)</Label>
                  <Input
                    id="pro_descuento_porcentaje"
                    type="number"
                    min="0"
                    max="100"
                    value={newPromotion.pro_descuento_porcentaje || ""}
                    onChange={(e) => setNewPromotion({...newPromotion, pro_descuento_porcentaje: parseFloat(e.target.value)})}
                    placeholder="20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pro_usos">Usos Actuales</Label>
                  <Input
                    id="pro_usos"
                    type="number"
                    min="0"
                    value={newPromotion.pro_usos || 0}
                    onChange={(e) => setNewPromotion({...newPromotion, pro_usos: parseInt(e.target.value)})}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ser_id">Servicio</Label>
                <Select onValueChange={(value) => setNewPromotion({...newPromotion, ser_id: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.ser_id} value={service.ser_id.toString()}>
                        {service.ser_nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleAddPromotion}
                disabled={submitting}
              >
                {submitting ? "Creando..." : "Crear Promoción"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promociones Activas
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActivePromotions().length}</div>
            <p className="text-xs text-muted-foreground">
              {promotions.length} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ahorros Generados
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${getTotalSavings().toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total acumulado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promoción Más Usada
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getMostUsedPromotion()?.pro_usos || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {getMostUsedPromotion()?.pro_nombre || "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promedio Descuento
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promotions.length > 0 
                ? (promotions.reduce((sum, p) => sum + p.pro_descuento_porcentaje, 0) / promotions.length).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Descuento promedio
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Promociones</CardTitle>
          <CardDescription>
            Gestiona todas las promociones del salón
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Cargando promociones...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promotion) => {
                  const status = getPromotionStatus(promotion.pro_fecha_inicio, promotion.pro_fecha_fin);
                  return (
                    <TableRow key={promotion.pro_id}>
                      <TableCell className="font-medium">{promotion.pro_nombre}</TableCell>
                      <TableCell>{promotion.ser_nombre}</TableCell>
                      <TableCell>{promotion.pro_descuento_porcentaje}%</TableCell>
                      <TableCell className="text-sm">
                        <div>{promotion.pro_fecha_inicio}</div>
                        <div className="text-muted-foreground">a {promotion.pro_fecha_fin}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>{promotion.pro_usos}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Find the service ID for this promotion
                              const serviceId = services.find(s => s.ser_nombre === promotion.ser_nombre)?.ser_id || 1;
                              setEditingPromotion({...promotion, ser_id: serviceId});
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePromotion(promotion.pro_id)}
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
          )}
        </CardContent>
      </Card>

      {editingPromotion && (
        <Dialog open={!!editingPromotion} onOpenChange={() => setEditingPromotion(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Promoción</DialogTitle>
              <DialogDescription>
                Modifica la información de la promoción.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_pro_nombre">Nombre de la Promoción</Label>
                <Input
                  id="edit_pro_nombre"
                  value={editingPromotion.pro_nombre}
                  onChange={(e) => setEditingPromotion({...editingPromotion, pro_nombre: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_pro_descripcion">Descripción</Label>
                <Textarea
                  id="edit_pro_descripcion"
                  value={editingPromotion.pro_descripcion}
                  onChange={(e) => setEditingPromotion({...editingPromotion, pro_descripcion: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_pro_fecha_inicio">Fecha de Inicio</Label>
                  <Input
                    id="edit_pro_fecha_inicio"
                    type="date"
                    value={editingPromotion.pro_fecha_inicio}
                    onChange={(e) => setEditingPromotion({...editingPromotion, pro_fecha_inicio: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_pro_fecha_fin">Fecha de Fin</Label>
                  <Input
                    id="edit_pro_fecha_fin"
                    type="date"
                    value={editingPromotion.pro_fecha_fin}
                    onChange={(e) => setEditingPromotion({...editingPromotion, pro_fecha_fin: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_pro_descuento_porcentaje">Descuento (%)</Label>
                  <Input
                    id="edit_pro_descuento_porcentaje"
                    type="number"
                    min="0"
                    max="100"
                    value={editingPromotion.pro_descuento_porcentaje}
                    onChange={(e) => setEditingPromotion({...editingPromotion, pro_descuento_porcentaje: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_pro_usos">Usos Actuales</Label>
                  <Input
                    id="edit_pro_usos"
                    type="number"
                    min="0"
                    value={editingPromotion.pro_usos}
                    onChange={(e) => setEditingPromotion({...editingPromotion, pro_usos: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_ser_id">Servicio</Label>
                <Select 
                  value={editingPromotion.ser_id?.toString() || ""} 
                  onValueChange={(value) => setEditingPromotion({...editingPromotion, ser_id: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.ser_id} value={service.ser_id.toString()}>
                        {service.ser_nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleUpdatePromotion}
                disabled={submitting}
              >
                {submitting ? "Actualizando..." : "Actualizar Promoción"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PromotionManagement;