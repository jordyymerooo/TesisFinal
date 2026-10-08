/**
 * LandlordRegisterScreen.tsx
 * Pantalla dedicada de registro para arrendadores con validaciones y correos generales permitidos.
 */

import React from "react";
import { RegisterScreen } from "./RegisterScreen";

export interface LandlordRegisterScreenProps {
  onSuccess: (userData: { token: string; user: any }) => void;
  onBack: () => void;
}

export function LandlordRegisterScreen({ onSuccess, onBack }: LandlordRegisterScreenProps) {
  return <RegisterScreen role="arrendador" onSuccess={onSuccess} onBack={onBack} />;
}

export { LandlordRegisterScreen as RegisterLandlordScreen };
export default LandlordRegisterScreen;
