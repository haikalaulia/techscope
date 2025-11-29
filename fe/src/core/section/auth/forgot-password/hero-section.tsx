import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import View from '@/components/ui/view';
import { FormForgotPassword } from '@/types/form/auth.form';

interface ForgotPasswordProps {
  formForgotPassword: FormForgotPassword;
  setFormForgotPassword: React.Dispatch<React.SetStateAction<FormForgotPassword>>;
  isPending: boolean;
  onForgot: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordProps> = ({
  formForgotPassword,
  isPending,
  onForgot,
  setFormForgotPassword,
}) => {
  return (
    <View className="flex flex-col gap-6'">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot Password</CardTitle>
          <CardDescription>We will provide you with an OTP code</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onForgot();
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email :</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formForgotPassword.email}
                  onChange={(e) =>
                    setFormForgotPassword((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <Button disabled={isPending} type="submit">
                  {isPending ? 'Wait' : 'Send'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <Link href="#">Terms of Service</Link> and{' '}
        <Link href="#">Privacy Policy</Link>.
      </FieldDescription>
    </View>
  );
};

export default ForgotPasswordForm;
