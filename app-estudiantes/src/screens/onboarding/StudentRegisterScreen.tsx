/**
 * StudentRegisterScreen.tsx
 * Pantalla dedicada de registro para estudiantes universitarios de la ULEAM.
 */

import React from "react";
import { RegisterScreen } from "./RegisterScreen";

export interface StudentRegisterScreenProps {
  onSuccess: (userData: { token: string; user: any }) => void;
  onBack: () => void;
}

export function StudentRegisterScreen({ onSuccess, onBack }: StudentRegisterScreenProps) {
  return <RegisterScreen role="estudiante" onSuccess={onSuccess} onBack={onBack} />;
}

export default StudentRegisterScreen;
