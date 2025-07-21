
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

interface Employee {
  emp_id: number;
  emp_nombre: string;
  emp_apellido: string;
  emp_puesto: string;
  emp_telefono?: string;
  emp_correo?: string;
}

interface Service {
  ser_id: number;
  ser_nombre: string;
  ser_descripcion?: string;
  ser_categoria: string;
  ser_precio_unitario: number;
  ser_duracion_estimada?: number;
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

// Extended appointment interface for client view with employee and service details
interface AppointmentWithDetails extends Appointment {
  empleado?: {
    emp_nombre: string;
    emp_apellido: string;
  };
  servicio?: {
    ser_nombre: string;
    ser_precio_unitario: number;
  };
}

interface ClientManagementProps {
  currentUser?: {
    userType: string;
    email: string;
  } | null;
}

const ClientManagement = ({ currentUser }: ClientManagementProps) => {
  const { toast } = useToast();
  // API URL is configured through Docker environment variables
  // Fallback for local development outside Docker
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<(Appointment | AppointmentWithDetails)[]>([]);

  const [newClient, setNewClient] = useState<Partial<Client>>({});
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({});
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load clients and appointments when component mounts
  useEffect(() => {
    testClientEndpoint(); // Test connectivity first
    fetchClients();
    
    // Only fetch employees and services if user needs them (for appointments)
    fetchEmployees();
    fetchServices();
    fetchAppointments();

    // Set up interval to update appointment status every 5 minutes
    const statusUpdateInterval = setInterval(() => {
      setAppointments(prevAppointments =>
        updateAppointmentStatusBasedOnDate(prevAppointments)
      );
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup interval on component unmount
    return () => {
      clearInterval(statusUpdateInterval);
    };
  }, []);

  // Preselect current client when opening appointment dialog
  useEffect(() => {
    if (isAddingAppointment && currentUser?.userType === 'cliente') {
      if (clients.length > 0) {
        // Find the current client by email from the fetched clients
        const currentClient = clients.find(client => client.cli_correo === currentUser.email);
        if (currentClient && !newAppointment.cli_id) {
          setNewAppointment(prev => ({
            ...prev,
            cli_id: currentClient.cli_id
          }));
        }
      } else {
        // If no clients are loaded yet, we'll create a temporary representation
        // The actual client ID will be resolved on the backend using the JWT token
        // console.log('Client list not loaded yet, will use JWT token for client identification');
      }
    }
  }, [isAddingAppointment, clients, currentUser, newAppointment.cli_id]);

  // Test function to check API connectivity
  const testClientEndpoint = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/clients/test`);
      if (response.ok) {
        const data = await response.json();
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

      // If current user is a client, fetch only their profile
      const endpoint = currentUser?.userType === 'cliente' 
        ? `${apiUrl}/api/clients/profile`
        : `${apiUrl}/api/clients`;

      const response = await fetch(endpoint, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle different response structures
        if (currentUser?.userType === 'cliente') {
          // For client profile endpoint, data.client contains single client
          setClients(data.client ? [data.client] : []);
        } else {
          // For admin/employee endpoint, data.clients contains array of clients
          setClients(data.clients || []);
        }
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

  // API function to fetch employees
  const fetchEmployees = async () => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/employees`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      } else {
        console.error('Failed to fetch employees');
        toast({
          title: "Error",
          description: "No se pudieron cargar los empleados",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los empleados",
        variant: "destructive"
      });
    }
  };

  // API function to fetch services
  const fetchServices = async () => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/services`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      } else {
        console.error('Failed to fetch services');
        toast({
          title: "Error",
          description: "No se pudieron cargar los servicios",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los servicios",
        variant: "destructive"
      });
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

      // Use different endpoint for client profile updates
      const endpoint = currentUser?.userType === 'cliente' 
        ? `${apiUrl}/api/clients/profile`
        : `${apiUrl}/api/clients/${client.cli_id}`;

      const response = await fetch(endpoint, {
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

  const handleAddAppointment = async () => {
    // For client users, we don't require cli_id to be set since it will be resolved from JWT
    const isClientUser = currentUser?.userType === 'cliente';
    
    if ((!isClientUser && !newAppointment.cli_id) || !newAppointment.emp_id || !newAppointment.ser_id || !newAppointment.cit_fecha || !newAppointment.cit_hora) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos de la cita",
        variant: "destructive"
      });
      return;
    }

    // Validate appointment date is not in the past
    const appointmentDateTime = new Date(`${newAppointment.cit_fecha}T${newAppointment.cit_hora}`);
    const now = new Date();

    if (appointmentDateTime <= now) {
      toast({
        title: "Error",
        description: "No se puede programar una cita en el pasado",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const success = await createAppointment(newAppointment);
      if (success) {
        setNewAppointment({});
        setIsAddingAppointment(false);
      }
    } finally {
      setSubmitting(false);
    }
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

  // Function to update appointment status based on date comparison
  const updateAppointmentStatusBasedOnDate = (appointments: (Appointment | AppointmentWithDetails)[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate date comparison

    return appointments.map(appointment => {
      // Parse appointment date
      const appointmentDate = new Date(`${appointment.cit_fecha}T00:00:00-05:00`);
      const appointmentDateTime = new Date(`${appointment.cit_fecha}T${appointment.cit_hora}-05:00`);
      appointmentDate.setHours(0, 0, 0, 0);

      // Only update status if currently "Programada"
      if (appointment.estado === "Programada") {
        // If appointment date is in the past, mark as completed
        if (appointmentDate < today) {
          return { ...appointment, estado: "Completada" as const };
        }
        // If appointment is today, we can check time too for more precision
        else if (appointmentDate.getTime() === today.getTime()) {
          const currentTime = new Date();
          // If appointment time has passed today, mark as completed
          if (appointmentDateTime < currentTime) {
            return { ...appointment, estado: "Completada" as const };
          } else {
            return { ...appointment, estado: "Programada" as const };
          }
        }
      }

      return appointment;
    });
  };

  // Function to get appointment status with automatic date-based updates
  const getAppointmentStatusWithDateCheck = (appointment: Appointment): "Programada" | "Completada" | "Cancelada" => {
    return appointment.estado
  };

  // Function to get relative date description
  const getRelativeDateDescription = (appointmentDate: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate date comparison
    
    // Handle both ISO format (2025-07-21T00:00:00Z) and simple date format (2025-07-21)
    const appointmentDateOnly = appointmentDate.includes('T') ? appointmentDate.split('T')[0] : appointmentDate;
    const appointment = new Date(appointmentDateOnly + 'T00:00:00');
    appointment.setHours(0, 0, 0, 0);
    
    const diffTime = appointment.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Hace ${Math.abs(diffDays)} día(s)`;
    } else if (diffDays === 0) {
      return "Hoy";
    } else if (diffDays === 1) {
      return "Mañana";
    } else {
      return `En ${diffDays} día(s)`;
    }
  };

  // Function to get appointment urgency level
  const getAppointmentUrgency = (appointmentDate: string, appointmentTime: string): "overdue" | "today" | "tomorrow" | "upcoming" | "future" => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate date comparison
    
    // Handle both ISO format (2025-07-21T00:00:00Z) and simple date format (2025-07-21)
    const appointmentDateOnly = appointmentDate.includes('T') ? appointmentDate.split('T')[0] : appointmentDate;
    const appointment = new Date(appointmentDateOnly + 'T00:00:00');
    appointment.setHours(0, 0, 0, 0);
    
    const appointmentDateTime = new Date(`${appointmentDateOnly}T${appointmentTime}`);

    if (appointmentDateTime < new Date()) {
      return "overdue";
    } else if (appointment.getTime() === today.getTime()) {
      return "today";
    } else if (appointment.getTime() - today.getTime() === 24 * 60 * 60 * 1000) {
      return "tomorrow";
    } else if (appointment.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) {
      return "upcoming";
    } else {
      return "future";
    }
  };

  // Function to get row styling based on urgency
  const getRowStyling = (appointmentDate: string, appointmentTime: string): string => {
    const urgency = getAppointmentUrgency(appointmentDate, appointmentTime);

    switch (urgency) {
      case "overdue":
        return "bg-orange-50 border-l-4 border-orange-400";
      case "today":
        return "bg-blue-50 border-l-4 border-blue-400";
      case "tomorrow":
        return "bg-yellow-50 border-l-4 border-yellow-400";
      case "upcoming":
        return "bg-green-50 border-l-4 border-green-400";
      default:
        return "";
    }
  };

  // API function to fetch appointments
  const fetchAppointments = async () => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token && token !== 'null' && token !== 'undefined') {
        headers.Authorization = `Bearer ${token}`;
      }

      // Use different endpoint based on user role
      const endpoint = isClientUser() ? `${apiUrl}/api/appointments/my` : `${apiUrl}/api/appointments`;
      
      const response = await fetch(endpoint, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        const appointmentsWithStatus = updateAppointmentStatusBasedOnDate(data.appointments || []);
        setAppointments(appointmentsWithStatus);
      } else {
        console.error('Failed to fetch appointments');
        toast({
          title: "Error",
          description: "No se pudieron cargar las citas",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  // API function to create appointment
  const createAppointment = async (appointment: Partial<Appointment>) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token && token !== 'null' && token !== 'undefined') {
        headers.Authorization = `Bearer ${token}`;
      }

      // For client users, if cli_id is not set, the backend will resolve it from JWT
      const appointmentData: any = {
        cit_fecha: appointment.cit_fecha,
        cit_hora: appointment.cit_hora,
        emp_id: appointment.emp_id,
        ser_id: appointment.ser_id,
      };

      // Only include cli_id if it's set (for admin/employee users or when client data is available)
      if (appointment.cli_id) {
        appointmentData.cli_id = appointment.cli_id;
      }

      const response = await fetch(`${apiUrl}/api/appointments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Cita creada",
          description: "La cita ha sido programada exitosamente"
        });
        fetchAppointments(); // Refresh the list
        return true;
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "No se pudo crear la cita",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      return false;
    }
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

  // Enhanced functions for appointments with details (for client users)
  const getAppointmentEmployeeName = (appointment: Appointment | AppointmentWithDetails) => {
    if ('empleado' in appointment && appointment.empleado) {
      return `${appointment.empleado.emp_nombre} ${appointment.empleado.emp_apellido}`;
    }
    return getEmployeeName(appointment.emp_id);
  };

  const getAppointmentServiceName = (appointment: Appointment | AppointmentWithDetails) => {
    if ('servicio' in appointment && appointment.servicio) {
      return appointment.servicio.ser_nombre;
    }
    return getServiceName(appointment.ser_id);
  };

  const getAppointmentServicePrice = (appointment: Appointment | AppointmentWithDetails) => {
    if ('servicio' in appointment && appointment.servicio) {
      return appointment.servicio.ser_precio_unitario;
    }
    const service = services.find(s => s.ser_id === appointment.ser_id);
    return service ? service.ser_precio_unitario : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Programada": return "bg-blue-100 text-blue-700";
      case "Completada": return "bg-orange-100 text-orange-700";
      case "Cancelada": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };
  const isClientUser = () => {
    return currentUser?.userType === 'cliente';
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
          {currentUser?.userType !== 'cliente' && (
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
          )}

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
                              {currentUser?.userType !== 'cliente' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteClient(client.cli_id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
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
          {/* Appointment Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {appointments.filter(apt => getAppointmentUrgency(apt.cit_fecha, apt.cit_hora) === "today").length}
                </div>
                <p className="text-xs text-gray-500">citas programadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Mañana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {appointments.filter(apt => getAppointmentUrgency(apt.cit_fecha, apt.cit_hora) === "tomorrow").length}
                </div>
                <p className="text-xs text-gray-500">citas programadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Esta Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {appointments.filter(apt => getAppointmentUrgency(apt.cit_fecha, apt.cit_hora) === "upcoming").length}
                </div>
                <p className="text-xs text-gray-500">citas próximas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Completadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {appointments.filter(apt => getAppointmentStatusWithDateCheck(apt) === "Completada").length}
                </div>
                <p className="text-xs text-gray-500">citas realizadas</p>
              </CardContent>
            </Card>
          </div>

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
                      className={`w-full p-2 border rounded-md ${currentUser?.userType === 'cliente' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      value={newAppointment.cli_id || ""}
                      disabled={currentUser?.userType === 'cliente'}
                      onChange={(e) => setNewAppointment({...newAppointment, cli_id: parseInt(e.target.value)})}
                    >
                      {currentUser?.userType === 'cliente' ? (
                        // For client users, show their profile if available, otherwise show placeholder
                        clients.length > 0 ? (
                          clients.filter(client => client.cli_correo === currentUser.email).map(client => (
                            <option key={client.cli_id} value={client.cli_id}>
                              {client.cli_nombre} {client.cli_apellido}
                            </option>
                          ))
                        ) : (
                          <option value="">Tu perfil (se seleccionará automáticamente)</option>
                        )
                      ) : (
                        // For admin/employee users, show all clients
                        <>
                          <option value="">Seleccionar cliente</option>
                          {clients.map(client => (
                            <option key={client.cli_id} value={client.cli_id}>
                              {client.cli_nombre} {client.cli_apellido}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    {currentUser?.userType === 'cliente' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Se seleccionará automáticamente tu perfil como cliente
                      </p>
                    )}
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
                        min={new Date().toISOString().split('T')[0]} // Prevent past dates
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
                    {!isClientUser() && <TableHead>Cliente</TableHead>}
                    <TableHead>Empleado</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.cit_id} className={getRowStyling(appointment.cit_fecha, appointment.cit_hora)}>
                      {/* Hide client column for client users since they only see their own appointments */}
                      {!isClientUser() && <TableCell>{getClientName(appointment.cli_id)}</TableCell>}
                      <TableCell>{getAppointmentEmployeeName(appointment)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{getAppointmentServiceName(appointment)}</span>
                          {isClientUser() && (
                            <span className="text-sm text-gray-500">
                              ${getAppointmentServicePrice(appointment).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {appointment.cit_fecha}
                            <Clock className="h-4 w-4 text-gray-500 ml-2" />
                            {appointment.cit_hora}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getRelativeDateDescription(appointment.cit_fecha)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(getAppointmentStatusWithDateCheck(appointment))}>
                          {getAppointmentStatusWithDateCheck(appointment)}
                        </Badge>
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
