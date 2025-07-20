import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Receipt, Edit, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Client {
  cli_id: number;
  cli_nombre: string;
  cli_apellido: string;
}

interface Service {
  ser_id: number;
  ser_nombre: string;
  ser_precio_unitario: number;
}

interface Invoice {
  fac_id: number;
  fac_total: number;
  fac_fecha: string;
  fac_hora: string;
  cli_id: number;
  cli_nombre: string;
  servicios: string;
}

interface CreateInvoiceRequest {
  cli_id: number;
  fecha: string;
  hora: string;
  servicios: number[];
}

const InvoiceManagement = () => {
  const { toast } = useToast();
  // API URL is configured through Docker environment variables
  // Fallback for local development outside Docker
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isAddingInvoice, setIsAddingInvoice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [newInvoice, setNewInvoice] = useState<CreateInvoiceRequest>({
    cli_id: 0,
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    servicios: []
  });

  // Get authentication token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || null;
  };


  // Fetch data from API
  const fetchInvoices = async () => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${apiUrl}/api/invoices/details`, {
        headers
      });
      const data = await response.json();
      if (response.ok) {
        setInvoices(data.invoices || []);
      } else {
        throw new Error(data.error || 'Failed to fetch invoices');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar las facturas",
        variant: "destructive"
      });
    }
  };

  const fetchClients = async () => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${apiUrl}/api/clients`, {
        headers
      });
      const data = await response.json();
      if (response.ok) {
        setClients(data.clients || []);
      } else {
        throw new Error(data.error || 'Failed to fetch clients');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los clientes",
        variant: "destructive"
      });
    }
  };

  const fetchServices = async () => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${apiUrl}/api/services`, {
        headers
      });
      const data = await response.json();
      if (response.ok) {
        setServices(data.services || []);
      } else {
        throw new Error(data.error || 'Failed to fetch services');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los servicios",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchClients();
    fetchServices();
  }, []);

  const handleAddInvoice = async () => {
    if (!newInvoice.cli_id || newInvoice.servicios.length === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona un cliente y al menos un servicio",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${apiUrl}/api/invoices`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newInvoice),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Factura creada",
          description: "La factura ha sido creada exitosamente"
        });

        // Reset form and close dialog
        setNewInvoice({
          cli_id: 0,
          fecha: new Date().toISOString().split('T')[0],
          hora: new Date().toTimeString().slice(0, 5),
          servicios: []
        });
        setIsAddingInvoice(false);

        // Refresh invoices list
        fetchInvoices();
      } else {
        throw new Error(data.error || 'Failed to create invoice');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear la factura",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta factura?")) {
      return;
    }

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${apiUrl}/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Factura eliminada",
          description: "La factura ha sido eliminada exitosamente"
        });
        fetchInvoices();
      } else {
        throw new Error('Failed to delete invoice');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar la factura",
        variant: "destructive"
      });
    }
  };

  const handleServiceToggle = (serviceId: number) => {
    setNewInvoice(prev => ({
      ...prev,
      servicios: prev.servicios.includes(serviceId)
        ? prev.servicios.filter(id => id !== serviceId)
        : [...prev.servicios, serviceId]
    }));
  };

  const calculateSelectedServicesTotal = () => {
    console.log("Calculating total for services:", newInvoice.servicios);
    console.log("Available services:", services);
    return newInvoice.servicios.reduce((total, serviceId) => {
      const service = services.find(s => s.ser_id === serviceId);
      return total + (service?.ser_precio_unitario || 0);
    }, 0);
  };

  const getSelectedServicesNames = () => {
    return newInvoice.servicios
      .map(serviceId => services.find(s => s.ser_id === serviceId)?.ser_nombre)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Facturas</h2>
          <p className="text-muted-foreground">Administra las facturas de servicios</p>
        </div>
        <Dialog open={isAddingInvoice} onOpenChange={setIsAddingInvoice}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Factura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Factura</DialogTitle>
              <DialogDescription>
                Selecciona el cliente y los servicios para crear una nueva factura
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select
                    value={newInvoice.cli_id.toString()}
                    onValueChange={(value) => setNewInvoice({...newInvoice, cli_id: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.cli_id} value={client.cli_id.toString()}>
                          {client.cli_nombre} {client.cli_apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={newInvoice.fecha}
                    onChange={(e) => setNewInvoice({...newInvoice, fecha: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  value={newInvoice.hora}
                  onChange={(e) => setNewInvoice({...newInvoice, hora: e.target.value})}
                />
              </div>

              <div>
                <Label>Servicios</Label>
                <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-3">
                    {services.map((service) => (
                      <div key={service.ser_id} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`service-${service.ser_id}`}
                            checked={newInvoice.servicios.includes(service.ser_id)}
                            onCheckedChange={() => handleServiceToggle(service.ser_id)}
                          />
                          <Label
                            htmlFor={`service-${service.ser_id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {service.ser_nombre}
                          </Label>
                        </div>
                        <Badge variant="outline">
                          ${service.ser_precio_unitario?.toLocaleString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {newInvoice.servicios.length > 0 && (
                  <div className="mt-4 p-3 bg-pink-50 rounded-md">
                    <div className="text-sm">
                      <strong>Servicios seleccionados:</strong> {getSelectedServicesNames()}
                    </div>
                    <div className="text-sm font-bold text-pink-700 mt-1">
                      Total estimado: ${calculateSelectedServicesTotal().toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingInvoice(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddInvoice} disabled={isLoading}>
                {isLoading ? "Creando..." : "Crear Factura"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">facturas emitidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturación Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${invoices.reduce((total, invoice) => total + invoice.fac_total, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">ingresos totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Factura</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${invoices.length > 0 ? Math.round(invoices.reduce((total, invoice) => total + invoice.fac_total, 0) / invoices.length).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">valor promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Facturas</CardTitle>
          <CardDescription>
            Todas las facturas emitidas con sus detalles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factura #</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.fac_id}>
                  <TableCell className="font-medium">#{invoice.fac_id}</TableCell>
                  <TableCell>{invoice.cli_nombre}</TableCell>
                  <TableCell>{invoice.fac_fecha}</TableCell>
                  <TableCell>{invoice.fac_hora}</TableCell>
                  <TableCell className="max-w-xs truncate" title={invoice.servicios}>
                    {invoice.servicios}
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    ${invoice.fac_total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteInvoice(invoice.fac_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {invoices.length === 0 && (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No hay facturas</h3>
              <p className="text-muted-foreground">Crea tu primera factura para comenzar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceManagement;