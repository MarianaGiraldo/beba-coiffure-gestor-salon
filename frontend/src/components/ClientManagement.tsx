
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Calendar, Clock, EyeOff, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Client {
  cli_id: number;
  cli_nombre: string;
  cli_apellido: string;
  cli_telefono: string;
  cli_correo: string;
  cli_password?: string;
}

interface Appointment {
  cit_id: number;
  cit_fecha: string;
  cit_hora: string;
  emp_id: number;
  ser_id: number;
  cli_id: number;
  estado: "Programada" | "Completada" | "Cancelada";
}

const ClientManagement = () => {
  const { toast } = useToast();
  // API URL is configured through Docker environment variables
  // Fallback for local development outside Docker
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      cit_id: 1,
      cit_fecha: "2024-01-20",
      cit_hora: "10:00",
      emp_id: 1,
      ser_id: 1,
      cli_id: 1,
      estado: "Programada"
    },
    {
      cit_id: 2,
      cit_fecha: "2024-01-20",
      cit_hora: "14:00",
      emp_id: 2,
      ser_id: 2,
      cli_id: 2,
      estado: "Programada"
    }
  ]);

  const [newClient, setNewClient] = useState<Partial<Client>>({});
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({});
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Mock data for employees and services
  const employees = [
    { emp_id: 1, emp_nombre: "María", emp_apellido: "González", emp_puesto: "Estilista Senior" },
    { emp_id: 2, emp_nombre: "Carlos", emp_apellido: "Rodríguez", emp_puesto: "Barbero" }
  ];

  const services = [
    { ser_id: 1, ser_nombre: "Corte de Cabello", ser_precio_unitario: 25000 },
    { ser_id: 2, ser_nombre: "Coloración", ser_precio_unitario: 80000 },
    { ser_id: 3, ser_nombre: "Manicure", ser_precio_unitario: 20000 }
  ];

  // Load clients when component mounts
  useEffect(() => {
    testClientEndpoint(); // Test connectivity first
    fetchClients();
  }, []);

  // Test function to check API connectivity
  const testClientEndpoint = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/clients/test`);
      if (response.ok) {
        const data = await response.json();
        console.log('Client test endpoint response:', data);
      }
    } catch (error) {
      console.error('Client test endpoint error:', error);
    }
  };

  // Get authentication token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || null;
  };

  // API function to fetch clients
  const fetchClients = async () => {
    setLoading(true);
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
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      } else {
        if (response.status === 401) {
          toast({
            title: "Error de autenticación",
            description: "Por favor inicia sesión nuevamente",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "No se pudieron cargar los clientes",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // API function to create client
  const createClient = async (client: Partial<Client>) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/clients`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          cli_nombre: client.cli_nombre,
          cli_apellido: client.cli_apellido,
          cli_telefono: client.cli_telefono,
          cli_correo: client.cli_correo,
          cli_password: client.cli_password,
        }),
      });

      if (response.ok) {
        await fetchClients(); // Refresh the list
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creating client');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el cliente",
        variant: "destructive"
      });
      return false;
    }
  };

  // API function to update client
  const updateClient = async (client: Client) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/clients/${client.cli_id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          cli_nombre: client.cli_nombre,
          cli_apellido: client.cli_apellido,
          cli_telefono: client.cli_telefono,
          cli_correo: client.cli_correo,
        }),
      });

      if (response.ok) {
        await fetchClients(); // Refresh the list
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error updating client');
      }
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el cliente",
        variant: "destructive"
      });
      return false;
    }
  };

  // API function to delete client
  const deleteClient = async (id: number) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/clients/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        await fetchClients(); // Refresh the list
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error deleting client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el cliente",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleAddClient = async () => {
    if (!newClient.cli_nombre || !newClient.cli_apellido || !newClient.cli_correo || !newClient.cli_password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const success = await createClient(newClient);
      if (success) {
        setNewClient({});
        setIsAddingClient(false);
        toast({
          title: "Cliente agregado",
          description: "El cliente ha sido agregado exitosamente"
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAppointment = () => {
    if (!newAppointment.cli_id || !newAppointment.emp_id || !newAppointment.ser_id || !newAppointment.cit_fecha || !newAppointment.cit_hora) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos de la cita",
        variant: "destructive"
      });
      return;
    }

    const appointment: Appointment = {
      cit_id: Math.max(...appointments.map(a => a.cit_id), 0) + 1,
      cit_fecha: newAppointment.cit_fecha || "",
      cit_hora: newAppointment.cit_hora || "",
      emp_id: newAppointment.emp_id || 0,
      ser_id: newAppointment.ser_id || 0,
      cli_id: newAppointment.cli_id || 0,
      estado: "Programada"
    };

    setAppointments([...appointments, appointment]);
    setNewAppointment({});
    setIsAddingAppointment(false);
    toast({
      title: "Cita programada",
      description: "La cita ha sido programada exitosamente"
    });
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;

    if (!editingClient.cli_nombre || !editingClient.cli_apellido || !editingClient.cli_correo) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const success = await updateClient(editingClient);
      if (success) {
        setEditingClient(null);
        toast({
          title: "Cliente actualizado",
          description: "Los datos del cliente han sido actualizados"
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      const success = await deleteClient(id);
      if (success) {
        toast({
          title: "Cliente eliminado",
          description: "El cliente ha sido eliminado del sistema"
        });
      }
    }
  };

  const updateAppointmentStatus = (citId: number, newStatus: "Programada" | "Completada" | "Cancelada") => {
    setAppointments(appointments.map(apt => 
      apt.cit_id === citId ? { ...apt, estado: newStatus } : apt
    ));
    toast({
      title: "Estado actualizado",
      description: `La cita ha sido marcada como ${newStatus.toLowerCase()}`
    });
  };

  const getClientName = (cliId: number) => {
    const client = clients.find(c => c.cli_id === cliId);
    return client ? `${client.cli_nombre} ${client.cli_apellido}` : "Cliente desconocido";
  };

  const getEmployeeName = (empId: number) => {
    const employee = employees.find(e => e.emp_id === empId);
    return employee ? `${employee.emp_nombre} ${employee.emp_apellido}` : "Empleado desconocido";
  };

  const getServiceName = (serId: number) => {
    const service = services.find(s => s.ser_id === serId);
    return service ? service.ser_nombre : "Servicio desconocido";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Programada": return "bg-blue-100 text-blue-700";
      case "Completada": return "bg-green-100 text-green-700";
      case "Cancelada": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Clientes y Citas</h2>
          <p className="text-gray-600">Administra clientes y programa citas</p>
        </div>
      </div>

      <Tabs defaultValue="clients" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="appointments">Citas</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
              <DialogTrigger asChild>
                <Button className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                  <DialogDescription>
                    Completa la información del nuevo cliente
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cli-nombre">Nombre *</Label>
                      <Input
                        id="cli-nombre"
                        value={newClient.cli_nombre || ""}
                        onChange={(e) => setNewClient({...newClient, cli_nombre: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cli-apellido">Apellido *</Label>
                      <Input
                        id="cli-apellido"
                        value={newClient.cli_apellido || ""}
                        onChange={(e) => setNewClient({...newClient, cli_apellido: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cli-telefono">Teléfono</Label>
                    <Input
                      id="cli-telefono"
                      value={newClient.cli_telefono || ""}
                      onChange={(e) => setNewClient({...newClient, cli_telefono: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cli-correo">Correo Electrónico *</Label>
                    <Input
                      id="cli-correo"
                      type="email"
                      value={newClient.cli_correo || ""}
                      onChange={(e) => setNewClient({...newClient, cli_correo: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cli-password">Contraseña *</Label>
                    <div className="relative">
                      <Input
                        id="cli-password"
                        type={showPassword ? "text" : "password"}
                        value={newClient.cli_password || ""}
                        onChange={(e) => setNewClient({...newClient, cli_password: e.target.value})}
                      />
                      <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddClient} disabled={submitting}>
                    {submitting ? "Agregando..." : "Agregar Cliente"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                {clients.length} clientes registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-500">Cargando clientes...</div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                          No hay clientes registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      clients.map((client) => (
                        <TableRow key={client.cli_id}>
                          <TableCell>
                            <div className="font-medium">{client.cli_nombre} {client.cli_apellido}</div>
                          </TableCell>
                          <TableCell>{client.cli_telefono}</TableCell>
                          <TableCell>{client.cli_correo}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingClient(client)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteClient(client.cli_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAddingAppointment} onOpenChange={setIsAddingAppointment}>
              <DialogTrigger asChild>
                <Button className="bg-pink-600 hover:bg-pink-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Nueva Cita
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Programar Nueva Cita</DialogTitle>
                  <DialogDescription>
                    Programa una cita para un cliente
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="cliente">Cliente</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newAppointment.cli_id || ""}
                      onChange={(e) => setNewAppointment({...newAppointment, cli_id: parseInt(e.target.value)})}
                    >
                      <option value="">Seleccionar cliente</option>
                      {clients.map(client => (
                        <option key={client.cli_id} value={client.cli_id}>
                          {client.cli_nombre} {client.cli_apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="empleado">Empleado</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newAppointment.emp_id || ""}
                      onChange={(e) => setNewAppointment({...newAppointment, emp_id: parseInt(e.target.value)})}
                    >
                      <option value="">Seleccionar empleado</option>
                      {employees.map(emp => (
                        <option key={emp.emp_id} value={emp.emp_id}>
                          {emp.emp_nombre} {emp.emp_apellido} - {emp.emp_puesto}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="servicio">Servicio</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newAppointment.ser_id || ""}
                      onChange={(e) => setNewAppointment({...newAppointment, ser_id: parseInt(e.target.value)})}
                    >
                      <option value="">Seleccionar servicio</option>
                      {services.map(service => (
                        <option key={service.ser_id} value={service.ser_id}>
                          {service.ser_nombre} - ${service.ser_precio_unitario.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fecha">Fecha</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={newAppointment.cit_fecha || ""}
                        onChange={(e) => setNewAppointment({...newAppointment, cit_fecha: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hora">Hora</Label>
                      <Input
                        id="hora"
                        type="time"
                        value={newAppointment.cit_hora || ""}
                        onChange={(e) => setNewAppointment({...newAppointment, cit_hora: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddAppointment}>Programar Cita</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Citas Programadas</CardTitle>
              <CardDescription>
                {appointments.length} citas en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.cit_id}>
                      <TableCell>{getClientName(appointment.cli_id)}</TableCell>
                      <TableCell>{getEmployeeName(appointment.emp_id)}</TableCell>
                      <TableCell>{getServiceName(appointment.ser_id)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {appointment.cit_fecha}
                          <Clock className="h-4 w-4 text-gray-500 ml-2" />
                          {appointment.cit_hora}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(appointment.estado)}>
                          {appointment.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {appointment.estado === "Programada" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateAppointmentStatus(appointment.cit_id, "Completada")}
                              >
                                Completar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateAppointmentStatus(appointment.cit_id, "Cancelada")}
                              >
                                Cancelar
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingClient && (
        <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>
                Modifica la información del cliente
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-cli-nombre">Nombre *</Label>
                  <Input
                    id="edit-cli-nombre"
                    value={editingClient.cli_nombre}
                    onChange={(e) => setEditingClient({...editingClient, cli_nombre: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-cli-apellido">Apellido *</Label>
                  <Input
                    id="edit-cli-apellido"
                    value={editingClient.cli_apellido}
                    onChange={(e) => setEditingClient({...editingClient, cli_apellido: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-cli-telefono">Teléfono</Label>
                <Input
                  id="edit-cli-telefono"
                  value={editingClient.cli_telefono}
                  onChange={(e) => setEditingClient({...editingClient, cli_telefono: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-cli-correo">Correo Electrónico *</Label>
                <Input
                  id="edit-cli-correo"
                  type="email"
                  value={editingClient.cli_correo}
                  onChange={(e) => setEditingClient({...editingClient, cli_correo: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateClient} disabled={submitting}>
                {submitting ? "Actualizando..." : "Actualizar Cliente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClientManagement;
