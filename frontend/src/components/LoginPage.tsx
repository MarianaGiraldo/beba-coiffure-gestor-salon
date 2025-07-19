import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginPageProps {
  onLogin: (userType: 'admin' | 'employee' | 'client', userData: any) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const { toast } = useToast();
  // API URL is configured through Docker environment variables
  // Fallback for local development outside Docker
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [registerData, setRegisterData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleLogin = () => {
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    // Simulación de autenticación - aquí conectarías con tu API MySQL
    if (loginData.email === "admin@bebacoiffure.com" && loginData.password === "admin123") {
      onLogin('admin', { email: loginData.email, role: 'admin' });
      toast({
        title: "Bienvenido Administrador",
        description: "Has iniciado sesión exitosamente"
      });
    } else {
      // Aquí verificarías en la base de datos de empleados y clientes
      toast({
        title: "Error de autenticación",
        description: "Email o contraseña incorrectos",
        variant: "destructive"
      });
    }
  };

  const handleRegister = async () => {
    if (!registerData.nombre || !registerData.apellido || !registerData.email || !registerData.password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Llamar a la API para registrar el cliente
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: registerData.nombre,
          apellido: registerData.apellido,
          telefono: registerData.telefono,
          email: registerData.email,
          password: registerData.password,
          confirmPassword: registerData.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión."
        });
        
        // Limpiar formulario
        setRegisterData({
          nombre: "",
          apellido: "",
          telefono: "",
          email: "",
          password: "",
          confirmPassword: ""
        });
      } else {
        toast({
          title: "Error en el registro",
          description: data.error || "No se pudo crear la cuenta. Inténtalo de nuevo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error registrando cliente:", error);
      toast({
        title: "Error de conexión",
        description: "Error creando cliente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-pink-600 mb-2">Beba Coiffure</h1>
          <p className="text-gray-600">Sistema de Gestión de Salón</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Acceso al Sistema</CardTitle>
            <CardDescription className="text-center">
              Inicia sesión o regístrate como cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Tu contraseña"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
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
                  <Button onClick={handleLogin} className="w-full bg-pink-600 hover:bg-pink-700">
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        placeholder="Tu nombre"
                        value={registerData.nombre}
                        onChange={(e) => setRegisterData({...registerData, nombre: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="apellido">Apellido *</Label>
                      <Input
                        id="apellido"
                        placeholder="Tu apellido"
                        value={registerData.apellido}
                        onChange={(e) => setRegisterData({...registerData, apellido: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      placeholder="300 123 4567"
                      value={registerData.telefono}
                      onChange={(e) => setRegisterData({...registerData, telefono: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-email">Correo Electrónico *</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-password">Contraseña *</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirmar Contraseña *</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Repite tu contraseña"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                    />
                  </div>
                  <Button 
                    onClick={handleRegister} 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isLoading}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isLoading ? "Registrando..." : "Registrarse"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;