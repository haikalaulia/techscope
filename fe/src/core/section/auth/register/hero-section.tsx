import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import View from '@/components/ui/view';
import { FormRegister } from '@/types/form/auth.form';

interface RegisterFormProps {
  formRegister: FormRegister;
  setFormRegister: React.Dispatch<React.SetStateAction<FormRegister>>;
  onRegister: () => void;
  isPending: boolean;
  t: any;
}

const RegisterCard: React.FC<RegisterFormProps> = ({
  formRegister,
  onRegister,
  setFormRegister,
  isPending,
  t,
}) => {
  return (
    <View className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('auth.register.title')} </CardTitle>
          <CardDescription>{t('auth.register.deskripsi')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onRegister();
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
                  {t('auth.register.google')}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                {t('auth.register.spread')}
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="fullname">{t('auth.register.name')} :</FieldLabel>
                <Input
                  id="fullname"
                  type="text"
                  required
                  value={formRegister.fullName}
                  onChange={(e) =>
                    setFormRegister((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formRegister.email}
                  onChange={(e) =>
                    setFormRegister((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">{t('auth.register.password')}</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={formRegister.password}
                  required
                  onChange={(e) =>
                    setFormRegister((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Bentar' : 'Register'}
                </Button>
                <FieldDescription className="text-center">
                  {t('auth.register.notAccount')}{' '}
                  <Link href="/login">{t('auth.register.sign')}</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        {t('auth.register.fotterDeskripsi')} <Link href="#">{t('auth.register.terms')}</Link>
        {t('auth.register.and')} <Link href="#">{t('auth.register.privacy')}</Link>.
      </FieldDescription>
    </View>
  );
};

export default RegisterCard;
