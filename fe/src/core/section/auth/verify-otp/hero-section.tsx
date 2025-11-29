import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { FormVerifyOtp } from '@/types/form/auth.form';

interface OTPFormProps {
  formVerifyOtp: FormVerifyOtp;
  setFormVerifyOtp: React.Dispatch<React.SetStateAction<FormVerifyOtp>>;
  isPending: boolean;
  onVerify: () => void;
  colldown: number;
  onResend: () => void;
}

const OTPForm: React.FC<OTPFormProps> = ({
  formVerifyOtp,
  isPending,
  onVerify,
  setFormVerifyOtp,
  colldown,
  onResend,
}) => {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Enter verification code</CardTitle>
        <CardDescription>We sent a 6-digit code to your email.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onVerify();
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp" className="sr-only">
                Verification code
              </FieldLabel>
              <div className="w-full flex justify-center items-center">
                <InputOTP
                  maxLength={6}
                  id="otp"
                  value={formVerifyOtp.otp}
                  required
                  onChange={(e) =>
                    setFormVerifyOtp((prev) => ({
                      ...prev,
                      otp: e,
                    }))
                  }
                >
                  <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <FieldDescription className="text-center">
                Enter the 6-digit code sent to your email.
              </FieldDescription>
            </Field>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Wait' : 'Verify'}
            </Button>
            <FieldDescription className="text-center">
              Didn&apos;t receive the code?{' '}
              {colldown > 0 ? (
                <span className="textba">
                  Resend ({Math.floor(colldown / 60)}:{(colldown % 60).toString().padStart(2, '0')})
                </span>
              ) : (
                <button type="button" className="font-semibold " onClick={onResend}>
                  Resend
                </button>
              )}
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};

export default OTPForm;
