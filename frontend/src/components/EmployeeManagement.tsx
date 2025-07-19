
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EyeOff, Eye, Edit, Trash2, DollarSign, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  emp_id: number;
  emp_nombre: string;
  emp_apellido: string;
  emp_telefono: string;
  emp_correo: string;
  emp_puesto: string;
  emp_salario: number;
  emp_password?: string;
}

interface Payment {
  pag_id: number;
  pag_fecha: string;
  pag_monto: number;
  pag_metodo: string;
  emp_id: number;
}

const EmployeeManagement = () => {
  const { toast } = useToast();
  // API URL is configured through Docker environment variables
  // Fallback for local development outside Docker
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([
    {
      pag_id: 1,
      pag_fecha: "2024-01-15",
      pag_monto: 1500000,
      pag_metodo: "Transferencia",
      emp_id: 1
    }
  ]);

  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({});
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({});
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load employees when component mounts
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Get authentication token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || null;
  };

  // API function to fetch employees
  const fetchEmployees = async () => {
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

      const response = await fetch(`${apiUrl}/api/employees`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      } else {
        throw new Error('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los empleados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // API function to create employee
  const createEmployee = async (employee: Partial<Employee>) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/employees`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          emp_nombre: employee.emp_nombre,
          emp_apellido: employee.emp_apellido,
          emp_telefono: employee.emp_telefono,
          emp_correo: employee.emp_correo,
          emp_puesto: employee.emp_puesto,
          emp_salario: employee.emp_salario,
          emp_password: employee.emp_password,
        }),
      });

      if (response.ok) {
        await fetchEmployees(); // Refresh the list
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create employee');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el empleado",
        variant: "destructive"
      });
      return false;
    }
  };

  // API function to update employee
  const updateEmployee = async (employee: Employee) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/employees/${employee.emp_id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          emp_nombre: employee.emp_nombre,
          emp_apellido: employee.emp_apellido,
          emp_telefono: employee.emp_telefono,
          emp_correo: employee.emp_correo,
          emp_puesto: employee.emp_puesto,
          emp_salario: employee.emp_salario,
        }),
      });

      if (response.ok) {
        await fetchEmployees(); // Refresh the list
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el empleado",
        variant: "destructive"
      });
      return false;
    }
  };

  // API function to delete employee
  const deleteEmployee = async (id: number) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/employees/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        await fetchEmployees(); // Refresh the list
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el empleado",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.emp_nombre || !newEmployee.emp_apellido || !newEmployee.emp_puesto || !newEmployee.emp_correo || !newEmployee.emp_password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    if (!newEmployee.emp_salario || newEmployee.emp_salario <= 0) {
      toast({
        title: "Error",
        description: "El salario debe ser mayor a 0",
        variant: "destructive"
      });
      return;
    }

    const success = await createEmployee(newEmployee);
    if (success) {
      setNewEmployee({});
      setIsAddingEmployee(false);
      toast({
        title: "Empleado agregado",
        description: "El empleado ha sido agregado exitosamente"
      });
    }
  };

  const handleAddPayment = () => {
    if (!newPayment.emp_id || !newPayment.pag_monto || !newPayment.pag_metodo) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos del pago",
        variant: "destructive"
      });
      return;
    }

    const payment: Payment = {
      pag_id: Math.max(...payments.map(p => p.pag_id), 0) + 1,
      pag_fecha: new Date().toISOString().split('T')[0],
      pag_monto: newPayment.pag_monto || 0,
      pag_metodo: newPayment.pag_metodo || "",
      emp_id: newPayment.emp_id || 0
    };

    setPayments([...payments, payment]);
    setNewPayment({});
    setIsAddingPayment(false);
    toast({
      title: "Pago registrado",
      description: "El pago de salario ha sido registrado exitosamente"
    });
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    if (!editingEmployee.emp_nombre || !editingEmployee.emp_apellido || !editingEmployee.emp_puesto) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    if (!editingEmployee.emp_salario || editingEmployee.emp_salario <= 0) {
      toast({
        title: "Error",
        description: "El salario debe ser mayor a 0",
        variant: "destructive"
      });
      return;
    }

    const success = await updateEmployee(editingEmployee);
    if (success) {
      setEditingEmployee(null);
      toast({
        title: "Empleado actualizado",
        description: "Los datos del empleado han sido actualizados"
      });
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      const success = await deleteEmployee(id);
      if (success) {
        toast({
          title: "Empleado eliminado",
          description: "El empleado ha sido eliminado del sistema"
        });
      }
    }
  };

  const getEmployeeName = (empId: number) => {
    const employee = employees.find(e => e.emp_id === empId);
    return employee ? `${employee.emp_nombre} ${employee.emp_apellido}` : "Empleado desconocido";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h2>
          <p className="text-gray-600">Administra empleados y pagos de salarios</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddingEmployee} onOpenChange={setIsAddingEmployee}>
            <DialogTrigger asChild>
              <Button className="bg-pink-600 hover:bg-pink-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
                <DialogDescription>
                  Completa la información del nuevo empleado
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={newEmployee.emp_nombre || ""}
                      onChange={(e) => setNewEmployee({...newEmployee, emp_nombre: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input
                      id="apellido"
                      value={newEmployee.emp_apellido || ""}
                      onChange={(e) => setNewEmployee({...newEmployee, emp_apellido: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={newEmployee.emp_telefono || ""}
                    onChange={(e) => setNewEmployee({...newEmployee, emp_telefono: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="correo">Correo Electrónico</Label>
                  <Input
                    id="correo"
                    type="email"
                    value={newEmployee.emp_correo || ""}
                    onChange={(e) => setNewEmployee({...newEmployee, emp_correo: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="puesto">Puesto *</Label>
                  <Input
                    id="puesto"
                    value={newEmployee.emp_puesto || ""}
                    onChange={(e) => setNewEmployee({...newEmployee, emp_puesto: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="salario">Salario</Label>
                  <Input
                    id="salario"
                    type="number"
                    value={newEmployee.emp_salario || ""}
                    onChange={(e) => setNewEmployee({...newEmployee, emp_salario: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Contraseña del empleado"
                      value={newEmployee.emp_password || ""}
                      onChange={(e) => setNewEmployee({...newEmployee, emp_password: e.target.value})}
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
                <Button onClick={handleAddEmployee} disabled={loading}>
                  {loading ? "Agregando..." : "Agregar Empleado"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Registrar Pago
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Pago de Salario</DialogTitle>
                <DialogDescription>
                  Registra un nuevo pago de salario para un empleado
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="empleado">Empleado</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newPayment.emp_id || ""}
                    onChange={(e) => setNewPayment({...newPayment, emp_id: parseInt(e.target.value)})}
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
                  <Label htmlFor="monto">Monto</Label>
                  <Input
                    id="monto"
                    type="number"
                    value={newPayment.pag_monto || ""}
                    onChange={(e) => setNewPayment({...newPayment, pag_monto: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="metodo">Método de Pago</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newPayment.pag_metodo || ""}
                    onChange={(e) => setNewPayment({...newPayment, pag_metodo: e.target.value})}
                  >
                    <option value="">Seleccionar método</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Nequi">Nequi</option>
                    <option value="Daviplata">Daviplata</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddPayment}>Registrar Pago</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lista de Empleados</CardTitle>
            <CardDescription>
              {loading ? "Cargando..." : `${employees.length} empleados registrados`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Puesto</TableHead>
                  <TableHead>Salario</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.emp_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{employee.emp_nombre} {employee.emp_apellido}</div>
                        <div className="text-sm text-gray-500">{employee.emp_correo}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{employee.emp_puesto}</Badge>
                    </TableCell>
                    <TableCell>${employee.emp_salario.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingEmployee(employee)}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteEmployee(employee.emp_id)}
                          disabled={loading}
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

        <Card>
          <CardHeader>
            <CardTitle>Pagos de Salarios Recientes</CardTitle>
            <CardDescription>
              Últimos pagos registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.pag_id}>
                    <TableCell>{getEmployeeName(payment.emp_id)}</TableCell>
                    <TableCell>{payment.pag_fecha}</TableCell>
                    <TableCell>${payment.pag_monto.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.pag_metodo}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {editingEmployee && (
        <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Empleado</DialogTitle>
              <DialogDescription>
                Modifica la información del empleado
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nombre">Nombre</Label>
                  <Input
                    id="edit-nombre"
                    value={editingEmployee.emp_nombre}
                    onChange={(e) => setEditingEmployee({...editingEmployee, emp_nombre: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-apellido">Apellido</Label>
                  <Input
                    id="edit-apellido"
                    value={editingEmployee.emp_apellido}
                    onChange={(e) => setEditingEmployee({...editingEmployee, emp_apellido: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-telefono">Teléfono</Label>
                <Input
                  id="edit-telefono"
                  value={editingEmployee.emp_telefono}
                  onChange={(e) => setEditingEmployee({...editingEmployee, emp_telefono: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-correo">Correo Electrónico</Label>
                <Input
                  id="edit-correo"
                  type="email"
                  value={editingEmployee.emp_correo}
                  onChange={(e) => setEditingEmployee({...editingEmployee, emp_correo: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-puesto">Puesto</Label>
                <Input
                  id="edit-puesto"
                  value={editingEmployee.emp_puesto}
                  onChange={(e) => setEditingEmployee({...editingEmployee, emp_puesto: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-salario">Salario</Label>
                <Input
                  id="edit-salario"
                  type="number"
                  value={editingEmployee.emp_salario}
                  onChange={(e) => setEditingEmployee({...editingEmployee, emp_salario: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateEmployee} disabled={loading}>
                {loading ? "Actualizando..." : "Actualizar Empleado"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EmployeeManagement;
