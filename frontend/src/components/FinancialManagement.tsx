
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, DollarSign, TrendingDown, Receipt, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientPayment {
  pag_cli_id: number;
  fecha: string;
  monto: number;
  metodo: string;
  servicio: string;
  cliente: string;
}

interface Purchase {
  com_id: number;
  cop_fecha_compra: string;
  cop_total_compra: number;
  cop_metodo_pago: string;
  proveedor: string;
  productos: string;
}

interface EmployeePayment {
  pag_id: number;
  pag_fecha: string;
  pag_monto: number;
  pag_metodo: string;
  empleado: string;
  emp_nombre?: string;
  emp_apellido?: string;
  emp_id?: number;
}

interface Expense {
  gas_id: number;
  gas_descripcion: string;
  gas_fecha: string;
  gas_monto: number;
  gas_tipo: string;
}

const FinancialManagement = () => {
  const { toast } = useToast();
  
  // API URL configuration
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  
  // State management
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employeePayments, setEmployeePayments] = useState<EmployeePayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({});
  const [newPayment, setNewPayment] = useState<Partial<EmployeePayment>>({});
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  // Get authentication token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || null;
  };

  // Load data when component mounts
  useEffect(() => {
    fetchExpenses();
    fetchEmployeePayments();
  }, []);

  // Fetch expenses from API
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/expenses`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
      } else {
        throw new Error('Failed to fetch expenses');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los gastos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch employee payments from API
  const fetchEmployeePayments = async () => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/payments/with-employee`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        // Transform the data to match our interface
        const payments = (data.payments || []).map((payment: any) => ({
          pag_id: payment.pag_id,
          pag_fecha: payment.pag_fecha,
          pag_monto: payment.pag_monto,
          pag_metodo: payment.pag_metodo,
          empleado: payment.emp_nombre && payment.emp_apellido 
            ? `${payment.emp_nombre} ${payment.emp_apellido}` 
            : 'N/A',
          emp_nombre: payment.emp_nombre,
          emp_apellido: payment.emp_apellido
        }));
        setEmployeePayments(payments);
      } else {
        throw new Error('Failed to fetch employee payments');
      }
    } catch (error) {
      console.error('Error fetching employee payments:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pagos de empleados",
        variant: "destructive"
      });
    }
  };

  // Create expense
  const createExpense = async (expense: Partial<Expense>) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/expenses`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          gas_descripcion: expense.gas_descripcion,
          gas_fecha: expense.gas_fecha || new Date().toISOString().split('T')[0],
          gas_monto: expense.gas_monto,
          gas_tipo: expense.gas_tipo,
        }),
      });

      if (response.ok) {
        await fetchExpenses();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create expense');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el gasto",
        variant: "destructive"
      });
      return false;
    }
  };

  // Create payment
  const createPayment = async (payment: Partial<EmployeePayment>) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/payments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          pag_fecha: payment.pag_fecha || new Date().toISOString().split('T')[0],
          pag_monto: payment.pag_monto,
          pag_metodo: payment.pag_metodo,
          gas_id: 1, // Default expense ID - might need to be configurable
          emp_id: payment.emp_id || 1, // This should be selected from a dropdown
        }),
      });

      if (response.ok) {
        await fetchEmployeePayments();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el pago",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete expense
  const deleteExpense = async (id: number) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/expenses/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        await fetchExpenses();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el gasto",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete payment
  const deletePayment = async (id: number) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/payments/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        await fetchEmployeePayments();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete payment');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el pago",
        variant: "destructive"
      });
      return false;
    }
  };

  // Handler functions
  const handleAddExpense = async () => {
    if (!newExpense.gas_descripcion || !newExpense.gas_monto || !newExpense.gas_tipo) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos del gasto",
        variant: "destructive"
      });
      return;
    }

    if (newExpense.gas_monto <= 0) {
      toast({
        title: "Error",
        description: "El monto debe ser mayor a 0",
        variant: "destructive"
      });
      return;
    }

    const success = await createExpense(newExpense);
    if (success) {
      setNewExpense({});
      setIsAddingExpense(false);
      toast({
        title: "Gasto registrado",
        description: "El gasto ha sido registrado exitosamente"
      });
    }
  };

  const handleAddPayment = async () => {
    if (!newPayment.pag_monto || !newPayment.pag_metodo) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos del pago",
        variant: "destructive"
      });
      return;
    }

    if (newPayment.pag_monto <= 0) {
      toast({
        title: "Error",
        description: "El monto debe ser mayor a 0",
        variant: "destructive"
      });
      return;
    }

    const success = await createPayment(newPayment);
    if (success) {
      setNewPayment({});
      setIsAddingPayment(false);
      toast({
        title: "Pago registrado",
        description: "El pago ha sido registrado exitosamente"
      });
    }
  };

  const handleDeleteExpense = async (id: number) => {
    const success = await deleteExpense(id);
    if (success) {
      toast({
        title: "Gasto eliminado",
        description: "El gasto ha sido eliminado exitosamente"
      });
    }
  };

  const handleDeletePayment = async (id: number) => {
    const success = await deletePayment(id);
    if (success) {
      toast({
        title: "Pago eliminado",
        description: "El pago ha sido eliminado exitosamente"
      });
    }
  };

  // Utility functions
  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.gas_monto, 0);
  };

  const getTotalSalaries = () => {
    return employeePayments.reduce((total, payment) => total + payment.pag_monto, 0);
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: { [key: string]: string } = {
      "Efectivo": "bg-green-100 text-green-700",
      "Tarjeta": "bg-blue-100 text-blue-700",
      "Transferencia": "bg-purple-100 text-purple-700",
      "Nequi": "bg-yellow-100 text-yellow-700",
      "Daviplata": "bg-red-100 text-red-700"
    };
    return colors[method] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Gestión Financiera</h2>
        <Button 
          onClick={() => {
            fetchExpenses();
            fetchEmployeePayments();
          }} 
          variant="outline" 
          size="sm"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? "Actualizando..." : "Actualizar"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Generales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${getTotalExpenses().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total de gastos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salarios Pagados</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${getTotalSalaries().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pagos a empleados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
            <Receipt className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${(getTotalExpenses() + getTotalSalaries()).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Gastos + Salarios</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">Gastos Generales</TabsTrigger>
          <TabsTrigger value="salaries">Pagos de Salarios</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gastos Generales</CardTitle>
                  <CardDescription>Registro de gastos y egresos del salón</CardDescription>
                </div>
                <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Gasto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
                      <DialogDescription>
                        Ingresa los detalles del gasto a registrar.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="descripcion" className="text-right">
                          Descripción
                        </Label>
                        <Input
                          id="descripcion"
                          placeholder="Descripción del gasto"
                          className="col-span-3"
                          value={newExpense.gas_descripcion || ""}
                          onChange={(e) => setNewExpense({...newExpense, gas_descripcion: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="monto" className="text-right">
                          Monto
                        </Label>
                        <Input
                          id="monto"
                          type="number"
                          placeholder="0"
                          className="col-span-3"
                          value={newExpense.gas_monto || ""}
                          onChange={(e) => setNewExpense({...newExpense, gas_monto: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tipo" className="text-right">
                          Tipo
                        </Label>
                        <Input
                          id="tipo"
                          placeholder="Tipo de gasto"
                          className="col-span-3"
                          value={newExpense.gas_tipo || ""}
                          onChange={(e) => setNewExpense({...newExpense, gas_tipo: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fecha" className="text-right">
                          Fecha
                        </Label>
                        <Input
                          id="fecha"
                          type="date"
                          className="col-span-3"
                          value={newExpense.gas_fecha || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setNewExpense({...newExpense, gas_fecha: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddExpense}>Registrar Gasto</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.gas_id}>
                      <TableCell>{expense.gas_fecha}</TableCell>
                      <TableCell>{expense.gas_descripcion}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-100 text-gray-700">
                          {expense.gas_tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">${expense.gas_monto.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.gas_id)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {expenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        {loading ? "Cargando gastos..." : "No hay gastos registrados"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salaries" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Pagos de Salarios</CardTitle>
                  <CardDescription>Registro de pagos a empleados</CardDescription>
                </div>
                <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Pago
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Registrar Pago de Salario</DialogTitle>
                      <DialogDescription>
                        Ingresa los detalles del pago a empleado.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="monto-pago" className="text-right">
                          Monto
                        </Label>
                        <Input
                          id="monto-pago"
                          type="number"
                          placeholder="0"
                          className="col-span-3"
                          value={newPayment.pag_monto || ""}
                          onChange={(e) => setNewPayment({...newPayment, pag_monto: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="metodo-pago" className="text-right">
                          Método
                        </Label>
                        <Input
                          id="metodo-pago"
                          placeholder="Método de pago"
                          className="col-span-3"
                          value={newPayment.pag_metodo || ""}
                          onChange={(e) => setNewPayment({...newPayment, pag_metodo: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fecha-pago" className="text-right">
                          Fecha
                        </Label>
                        <Input
                          id="fecha-pago"
                          type="date"
                          className="col-span-3"
                          value={newPayment.pag_fecha || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setNewPayment({...newPayment, pag_fecha: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="emp-id" className="text-right">
                          ID Empleado
                        </Label>
                        <Input
                          id="emp-id"
                          type="number"
                          placeholder="ID del empleado"
                          className="col-span-3"
                          value={newPayment.emp_id || ""}
                          onChange={(e) => setNewPayment({...newPayment, emp_id: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddPayment}>Registrar Pago</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeePayments.map((payment) => (
                    <TableRow key={payment.pag_id}>
                      <TableCell>{payment.pag_fecha}</TableCell>
                      <TableCell>{payment.empleado}</TableCell>
                      <TableCell className="font-medium">${payment.pag_monto.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentMethodColor(payment.pag_metodo)}>
                          {payment.pag_metodo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeletePayment(payment.pag_id)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {employeePayments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        {loading ? "Cargando pagos..." : "No hay pagos registrados"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialManagement;
