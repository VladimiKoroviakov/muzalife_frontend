import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthContext } from "../context/AuthContext"; 
import { AuthLogoTitle } from "../components/auth/AuthLogoTitle";
import { InputField } from "../components/auth/InputField";
import { LoginSubmitButton } from "../components/auth/LoginSubmitButton";
import {CloseButton} from "../components/auth/CloseButton";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signInWithEmail, isLoading, user, isAuthenticated } = useAuthContext(); 

  useEffect(() => {
    if (isAuthenticated && user?.is_admin) {
      navigate('/admin', { replace: true });
      toast.success("Вхід успішний!");
    } else if (isAuthenticated && !user?.is_admin) {
      toast.error("Недостатньо прав доступу для адміністративної панелі");
    }
  }, [user, isAuthenticated, navigate]);

  const handleClose = () => {
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast.error("Будь ласка, заповніть всі поля");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Будь ласка, введіть дійсну email адресу");
      return;
    }
    const { error: authError } = await signInWithEmail(email, password, 'admin');
    
    if (authError) {
      toast.error(authError);
    }
  };

  return (
    <div className="bg-[#e6e6e6] relative size-full" data-name="Login screen">
      <div className="flex flex-col items-center max-w-inherit min-w-inherit size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] items-center max-w-inherit min-w-inherit px-[48px] py-[24px] relative size-full">
          {/* Main Canvas */}
          <div className="basis-0 content-stretch flex flex-col gap-[24px] grow items-center justify-center max-w-[1280px] min-h-px min-w-px relative rounded-[12px] shrink-0 w-full" data-name="Canvas">
            
            {/* Login Container */}
            <div className="box-border content-stretch flex flex-col gap-[48px] items-center p-[36px] relative rounded-[12px] shrink-0" data-name="Login">
              
              {/* Logo Title */}
              <AuthLogoTitle>
                <div className="flex flex-col justify-end leading-[0] relative shrink-0 text-[28px] text-black text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                  <p className="leading-[normal] whitespace-pre">Вітаємо, адміністраторе</p>
                </div>
              </AuthLogoTitle>

              {/* Email/Password Login Section */}
              <div className="content-stretch flex flex-col gap-[40px] items-center justify-center relative shrink-0 w-full" data-name="Simple login">
                <form onSubmit={handleSubmit} className="content-stretch flex flex-col gap-[28px] items-start relative shrink-0 w-full" data-name="Form">
                  <InputField 
                    value={email} 
                    onChange={setEmail} 
                    type="email" 
                    placeholder="Введіть Email адресу..." 
                  />
                  <InputField 
                    value={password} 
                    onChange={setPassword} 
                    type="password" 
                    placeholder="Введіть пароль..." 
                  />
                  <LoginSubmitButton isLoading={isLoading} />
                </form>
              </div>
            </div>

            <CloseButton onClick={handleClose}/>
          </div>
        </div>
      </div>
    </div>
  );
}