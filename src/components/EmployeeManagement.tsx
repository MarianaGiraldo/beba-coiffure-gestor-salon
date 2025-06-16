
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  emp_id: number;
  emp_nombre: string;
  emp_apellido: string;
  emp_telefono: string;
  emp_correo: string;
  emp_puesto: string;
  emp_salario: number;
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
  const [employees, setEmployees] = useState<Employee[]>([
    {
      emp_id: 1,
      emp_nombre: "María",
      emp_apellido: "González",
      emp_telefono: "3001234567",
      emp_correo: "maria@bebacoiffure.com",
      emp_puesto: "Estilista Senior",
      emp_salario: 1500000
    },
    {
      emp_id: 2,
      emp_nombre: "Carlos",
      emp_apellido: "Rodríguez",
      emp_telefono: "3007654321",
      emp_correo: "carlos@bebacoiffure.com",
      emp_puesto: "Barbero",
      emp_salario: 1200000
    }
  ]);

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

  const handleAddEmployee = () => {
    if (!newEmployee.emp_nombre || !newEmployee.emp_apellido || !newEmployee.emp_puesto) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const employee: Employee = {
      emp_id: Math.max(...employees.map(e => e.emp_id), 0) + 1,
      emp_nombre: newEmployee.emp_nombre || "",
      emp_apellido: newEmployee.emp_apellido || "",
      emp_telefono: newEmployee.emp_telefono || "",
      emp_correo: newEmployee.emp_correo || "",
      emp_puesto: newEmployee.emp_puesto || "",
      emp_salario: newEmployee.emp_salario || 0
    };

    setEmployees([...employees, employee]);
    setNewEmployee({});
    setIsAddingEmployee(false);
    toast({
      title: "Empleado agregado",
      description: "El empleado ha sido agregado exitosamente"
    });
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

  const handleUpdateEmployee = () => {
    if (!editingEmployee) return;

    setEmployees(employees.map(emp => 
      emp.emp_id === editingEmployee.emp_id ? editingEmployee : emp
    ));
    setEditingEmployee(null);
    toast({
      title: "Empleado actualizado",
      description: "Los datos del empleado han sido actualizados"
    });
  };

  const handleDeleteEmployee = (id: number) => {
    setEmployees(employees.filter(emp => emp.emp_id !== id));
    toast({
      title: "Empleado eliminado",
      description: "El empleado ha sido eliminado del sistema"
    });
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
              </div>
              <DialogFooter>
                <Button onClick={handleAddEmployee}>Agregar Empleado</Button>
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
              {employees.length} empleados registrados
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteEmployee(employee.emp_id)}
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
              <Button onClick={handleUpdateEmployee}>Actualizar Empleado</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EmployeeManagement;
