import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { EyeOff, Eye, AlertCircle} from "lucide-react";
import { UseFormRegister, FieldValues, Path, FieldError} from "react-hook-form";

type ShowPasswordButtonProps = {
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showPassword: boolean;
};

export function ShowPasswordButton({ setShowPassword, showPassword }: ShowPasswordButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? (
        <EyeOff className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Eye className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
    </Button>
  );
}

type PasswordInputProps<T extends FieldValues> = {
  id: string
  showPassword: boolean;
  passwordError: FieldError | undefined;
  registerFunc: UseFormRegister<T>;
  name: Path<T>;
}

export function PasswordInput<T extends FieldValues>({ id, showPassword, passwordError, registerFunc, name}: PasswordInputProps<T>){
  return (
    <>
      <Input
          id={id}
          type={showPassword ? "text" : "password"}
          {...registerFunc(name, { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })}
          autoCapitalize="none"
          className={`${passwordError ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
          autoComplete="password"
          autoCorrect="off"
      />
      { passwordError&& (
          <AlertCircle className="absolute right-9 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
      )}
    </>
    )
}


type ErrorAlertProps = {
  error: FieldError | undefined;
  defaultMessage?: string;
}

export function ErrorAlert({error, defaultMessage}:  ErrorAlertProps){
  return (
    <>
      {error ? (
          <p className="mt-1 text-sm text-red-700 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> 
              {error.message}
          </p>
      ):(
        <span className="text-sm text-gray-500 pt-1">{defaultMessage}</span>
      )}
    </>
  )
}