import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import View from "@/components/ui/view";
import { FormLogin } from "@/types/form/auth.form";
interface LoginFormProps {
  formLogin: FormLogin;
  setFormLogin: React.Dispatch<React.SetStateAction<FormLogin>>;
  onLogin: () => void;
  isPending: boolean;
  t: any;
}

const LoginForm: React.FC<LoginFormProps> = ({
  formLogin,
  onLogin,
  setFormLogin,
  isPending,
  t,
}) => {
  return (
    <View className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("auth.login.title")}</CardTitle>
          <CardDescription>{t("auth.login.deskripsi")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onLogin();
            }}
          >
            <FieldGroup>
              <Field>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {t("auth.login.google")}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                {t("auth.login.spread")}
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formLogin.email}
                  onChange={(e) =>
                    setFormLogin((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">
                    {t("auth.login.password")}
                  </FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    {t("auth.login.forgot")}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formLogin.password}
                  onChange={(e) =>
                    setFormLogin((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {t("auth.login.login")}
                </Button>
                <FieldDescription className="text-center">
                  {t("auth.login.notAccount")}
                  <Link href="/register">{t("auth.login.account")}</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        {t("auth.login.fotterDeskripsi")}
        <Link href="#">{t("auth.login.terms")}</Link>
        {t("auth.login.and")} <Link href="#">{t("auth.login.privacy")}</Link>.
      </FieldDescription>
    </View>
  );
};

export default LoginForm;
