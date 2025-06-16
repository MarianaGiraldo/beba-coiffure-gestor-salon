
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Client {
  cli_id: number;
  cli_nombre: string;
  cli_apellido: string;
  cli_telefono: string;
  cli_correo: string;
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
  const [clients, setClients] = useState<Client[]>([
    {
      cli_id: 1,
      cli_nombre: "Ana",
      cli_apellido: "Martínez",
      cli_telefono: "3009876543",
      cli_correo: "ana@email.com"
    },
    {
      cli_id: 2,
      cli_nombre: "Sofía",
      cli_apellido: "López",
      cli_telefono: "3005432109",
      cli_correo: "sofia@email.com"
    }
  ]);

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

  const handleAddClient = () => {
    if (!newClient.cli_nombre || !newClient.cli_apellido) {
      toast({
        title: "Error",
        description: "Por favor completa nombre y apellido",
        variant: "destructive"
      });
      return;
    }

    const client: Client = {
      cli_id: Math.max(...clients.map(c => c.cli_id), 0) + 1,
      cli_nombre: newClient.cli_nombre || "",
      cli_apellido: newClient.cli_apellido || "",
      cli_telefono: newClient.cli_telefono || "",
      cli_correo: newClient.cli_correo || ""
    };

    setClients([...clients, client]);
    setNewClient({});
    setIsAddingClient(false);
    toast({
      title: "Cliente agregado",
      description: "El cliente ha sido agregado exitosamente"
    });
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

  const handleUpdateClient = () => {
    if (!editingClient) return;

    setClients(clients.map(client => 
      client.cli_id === editingClient.cli_id ? editingClient : client
    ));
    setEditingClient(null);
    toast({
      title: "Cliente actualizado",
      description: "Los datos del cliente han sido actualizados"
    });
  };

  const handleDeleteClient = (id: number) => {
    setClients(clients.filter(client => client.cli_id !== id));
    toast({
      title: "Cliente eliminado",
      description: "El cliente ha sido eliminado del sistema"
    });
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
                    <Label htmlFor="cli-correo">Correo Electrónico</Label>
                    <Input
                      id="cli-correo"
                      type="email"
                      value={newClient.cli_correo || ""}
                      onChange={(e) => setNewClient({...newClient, cli_correo: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddClient}>Agregar Cliente</Button>
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
                  {clients.map((client) => (
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
                  ))}
                </TableBody>
              </Table>
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
                  <Label htmlFor="edit-cli-nombre">Nombre</Label>
                  <Input
                    id="edit-cli-nombre"
                    value={editingClient.cli_nombre}
                    onChange={(e) => setEditingClient({...editingClient, cli_nombre: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-cli-apellido">Apellido</Label>
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
                <Label htmlFor="edit-cli-correo">Correo Electrónico</Label>
                <Input
                  id="edit-cli-correo"
                  type="email"
                  value={editingClient.cli_correo}
                  onChange={(e) => setEditingClient({...editingClient, cli_correo: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateClient}>Actualizar Cliente</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClientManagement;
