import { useState, useEffect } from "react"; // Added useEffect
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { AuthLogoTitle } from "../components/auth/AuthLogoTitle";
import { AuthDivider } from "../components/auth/AuthDivider";
import { AuthRedirectLink } from "../components/auth/AuthRedirectLink";
import { GoogleLoginButton } from "../components/auth/GoogleLoginButton";
import { FacebookLoginButton } from "../components/auth/FacebookLoginButton";
import { InputField } from "../components/auth/InputField";
import { CloseButton } from "../components/auth/CloseButton";
import { VerificationCodeModal } from "../components/auth/VerificationModal";

// Add localStorage key for pending verification
const PENDING_VERIFICATION_KEY = 'pending_verification';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{
    email: string;
    password: string;
    name: string;
    loginType: 'regular';
    timestamp: number;
  } | null>(null);
  
  const { signUpWithEmail, completeRegistration } = useAuth();

  // Check for pending verification on component mount
  useEffect(() => {
    const savedVerification = localStorage.getItem(PENDING_VERIFICATION_KEY);
    if (savedVerification) {
      try {
        const parsed = JSON.parse(savedVerification);
        // Check if verification is still valid (e.g., within last 10 minutes)
        const TEN_MINUTES = 10 * 60 * 1000;
        if (Date.now() - parsed.timestamp < TEN_MINUTES) {
          setPendingRegistration(parsed);
          setShowVerificationModal(true);
          toast.info("Продовжіть підтвердження email");
        } else {
          // Clear expired verification
          localStorage.removeItem(PENDING_VERIFICATION_KEY);
        }
      } catch (error) {
        console.error('Error parsing saved verification:', error);
        localStorage.removeItem(PENDING_VERIFICATION_KEY);
      }
    }
  }, []);

  const handleClose = () => {
    navigate('/');
  };

  const onShowLogin = () => {
    navigate('/login');
  };

  const handleSignUpSuccess = () => {
    localStorage.removeItem(PENDING_VERIFICATION_KEY);
    navigate('/cabinet', { replace: true });
    toast.success(`Вітаємо, ${name.trim()}! Ви успішно зареєструвались!`);
  };

  const handleFacebookSuccess = () => {
    toast.success("Успішна реєстрація через Facebook!");
    handleSignUpSuccess();
  };

  const handleOAuthSuccess = () => {
    toast.success("Успішна реєстрація через Google!");
    handleSignUpSuccess();
  };

  const handleOAuthError = (error: string) => {
    console.error('OAuth error:', error);
    toast.error("Помилка реєстрації через Google");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if verification is already pending for this email
    const trimmedEmail = email.trim();
    
    if (pendingRegistration && pendingRegistration.email === trimmedEmail) {
      // Reopen the modal instead of trying to register again
      setShowVerificationModal(true);
      toast.info("Код підтвердження вже відправлено. Перевірте вашу пошту.");
      return;
    }
    
    // Name validation
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      toast.error("Будь ласка, введіть ваше ім'я");
      return;
    }
    
    if (trimmedName.length > 255) {
      toast.error("Ім'я не може перевищувати 255 символів");
      return;
    }
    
    if (!trimmedEmail) {
      toast.error("Будь ласка, введіть email адресу");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Будь ласка, введіть правильну email адресу");
      return;
    }
    
    if (!password) {
      toast.error("Будь ласка, введіть пароль");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Пароль повинен містити принаймні 6 символів");
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await signUpWithEmail(trimmedEmail, password, trimmedName);
      
      if (result.error) {
        // Check if this is actually the "verification already sent" error
        if (result.error.includes('Код підтвердження вже відправлено') || 
            result.error.includes('verification already sent')) {
          // Handle as verification needed
          const registrationData = {
            email: trimmedEmail,
            password,
            name: trimmedName,
            loginType: 'regular' as const,
            timestamp: Date.now()
          };
          
          setPendingRegistration(registrationData);
          localStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(registrationData));
          setShowVerificationModal(true);
          toast.info("Код підтвердження вже відправлено. Перевірте вашу пошту.");
        } else {
          toast.error(result.error);
        }
        return;
      }
      
      // If verification is required
      if (result.requiresVerification) {
        const registrationData = {
          email: trimmedEmail,
          password,
          name: trimmedName,
          loginType: 'regular' as const,
          timestamp: Date.now()
        };
        
        setPendingRegistration(registrationData);
        localStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(registrationData));
        setShowVerificationModal(true);
        toast.success("Код підтвердження відправлено на вашу електронну пошту!");
      } else {
        // Direct registration (for social logins or if verification is disabled)
        handleSignUpSuccess();
        toast.success(`Вітаємо, ${trimmedName}! Ви успішно зареєструвались!`);
        
        // Clear form
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error("Помилка реєстрації. Спробуйте ще раз");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowVerificationModal(false);
  };

  return (
    <>
      <div className="bg-[#e6e6e6] relative size-full" data-name="Sign Up screen">
        <div className="flex flex-col items-center max-w-inherit min-w-inherit size-full">
          <div className="box-border content-stretch flex flex-col gap-[24px] items-center max-w-inherit min-w-inherit px-[48px] py-[24px] relative size-full">
            {/* Main Canvas */}
            <div className="basis-0 content-stretch flex flex-col gap-[24px] grow items-center justify-center max-w-[1280px] min-h-px min-w-px relative rounded-[12px] shrink-0 w-full" data-name="Canvas">
              
              {/* Sign Up Container */}
              <div className="box-border content-stretch flex flex-col gap-[48px] items-center p-[36px] relative rounded-[12px] shrink-0" data-name="Login">
                
                {/* Logo Title */}
                <AuthLogoTitle>
                  <div className="content-stretch flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] gap-[20px] items-center leading-[0] relative shrink-0 text-nowrap" data-name="Text">
                    <div className="flex flex-col justify-end relative shrink-0 text-[28px] text-black" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                      <p className="leading-[normal] text-nowrap whitespace-pre">Вітаємо, шановний користувачу</p>
                    </div>
                    <div className="flex flex-col justify-end relative shrink-0 text-[#4d4d4d] text-[18px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                      <p className="leading-[normal] text-nowrap whitespace-pre">Введіть дані для реєстрації</p>
                    </div>
                  </div>
                </AuthLogoTitle>

                {/* OAuth Sign Up Section */}
                <div className="content-stretch flex flex-col gap-[28px] items-center relative shrink-0" data-name="Services Login">
                  <div className="content-stretch flex gap-[24px] items-center justify-center relative shrink-0 w-full" data-name="Google / Facebook">
                    <GoogleLoginButton 
                      onSuccess={handleOAuthSuccess} 
                      onError={handleOAuthError} 
                    />
                    <FacebookLoginButton 
                      onSuccess={handleFacebookSuccess}
                      onError={handleOAuthError}
                      defaultText="Продовжити з"
                    />
                  </div>
                  <AuthDivider />
                </div>

                {/* Email/Password Sign Up Section */}
                <div className="content-stretch flex flex-col gap-[40px] items-center justify-center relative shrink-0 w-full" data-name="Simple login">
                  <form onSubmit={handleSubmit} className="content-stretch flex flex-col gap-[28px] items-start relative shrink-0 w-full" data-name="Form">
                    <div className="w-full">
                      <InputField 
                        value={name} 
                        onChange={setName} 
                        type="text" 
                        placeholder="Введіть Ваше імʼя..." 
                        maxLength={256}
                      />
                    </div>
                    
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
                    
                    {/* Sign Up Submit Button */}
                    <button 
                      type="submit" 
                      disabled={
                        isLoading || 
                        name.trim().length === 0 || 
                        email.trim().length === 0 ||
                        password.length === 0
                      }
                      className="bg-[#5e89e8] h-[54px] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed" 
                      data-name="Button"
                    >
                      <div aria-hidden="true" className="absolute border border-[#5e89e8] border-solid inset-0 pointer-events-none rounded-[12px]" />
                      <div className="flex flex-row items-center justify-center size-full">
                        <div className="box-border content-stretch flex gap-[8px] h-[54px] items-center justify-center px-[24px] py-[16px] relative w-full">
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <div className="flex flex-col justify-end leading-[0] relative shrink-0 text-[18px] text-nowrap text-white" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
                              <p className="leading-[normal] whitespace-pre">Зареєструватись</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  </form>
                  
                  <AuthRedirectLink
                    text="Вже маєте особистий кабінет?"
                    linkText="Увійдіть"
                    onClick={onShowLogin}
                  />
                </div>
              </div>

              <CloseButton onClick={handleClose} />
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {pendingRegistration && (
      <VerificationCodeModal
        isOpen={showVerificationModal}
        email={pendingRegistration.email}
        title="Підтвердження Email"
        submitLabel="Підтвердити та зареєструватись"
        successToast="Email успішно підтверджено!"
        onSubmit={async (code) => {
          const { email, password, name } = pendingRegistration;

          const result = await completeRegistration(
            email,
            password,
            name,
            code
          );

          if (result.error) {
            throw new Error(result.error);
          }

          setPendingRegistration(null);
          setShowVerificationModal(false);

          handleSignUpSuccess();
        }}
        onResend={() =>
          apiService.resendVerificationCode(pendingRegistration.email)
        }
        onClose={handleModalClose}
      />
    )}
    </>
  );
}