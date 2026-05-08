import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { AuthTabs } from "../components/auth/AuthTabs";

export default function Login() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Ingresar</CardTitle>
          <CardDescription>
            Accede con tu email y contrasena o crea una cuenta nueva.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuthTabs />
        </CardContent>
      </Card>
    </div>
  );
}

