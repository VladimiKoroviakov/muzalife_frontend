import { useState } from "react";
import { toast } from "sonner";
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from "../../hooks/useAuth"; 
import imgGoogleLogo from "../../assets/images/Google-logo.png";

type GoogleLoginButtonProps = {
  onSuccess: () => void;
  onError: (error: string) => void;
  isLoading?: boolean;
};

export function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const { signInWithOAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // The button is clicked, now we are validating with the backend
      if (!isLoading) setIsLoading(true); 
      
      try {
        console.log('Google login successful, sending to backend...');
        const { error } = await signInWithOAuth('google', tokenResponse.access_token);
        
        if (error) {
          console.error('Backend OAuth error:', error);
          toast.error("Помилка входу через Google");
          onError(error);
        } else {
          console.log('Backend OAuth success, calling onSuccess prop.');
          // We don't show toast here. The parent component does.
          onSuccess();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Google authentication failed';
        console.error('Google auth failed:', error);
        toast.error("Помилка входу через Google");
        onError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      // Handle errors from the Google popup itself
      const errorMessage = (error && ('error_description' in error)) ? error.error_description : 'Google login failed';
      console.error('Google login failed:', error);
      toast.error("Помилка входу через Google");
      onError(errorMessage || 'Google login failed');
      setIsLoading(false);
    },
    onNonOAuthError: () => {
      console.error('Google non-OAuth error');
      toast.error("Помилка входу через Google");
      onError('Google authentication not available');
      setIsLoading(false);
    },
    flow: 'implicit',
  });

  const handleLoginClick = () => {
    setIsLoading(true); // Show loading immediately on click
    googleLogin();
  };

  return (
    <button
      onClick={handleLoginClick}
      disabled={isLoading}
      className="bg-[#f2f2f2] box-border content-stretch flex gap-[4px] h-[52px] items-center px-[16px] py-[4px] relative rounded-[16px] shrink-0 cursor-pointer hover:bg-[#e8e8e8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      data-name="Google"
      type="button"
    >
      <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="relative shrink-0 size-[36px]" data-name="Google-Logo">
        <img alt="Google" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgGoogleLogo} />
      </div>
      <div className="flex flex-col justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[0px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[normal] whitespace-pre">
          <span className="text-[18px]">{isLoading ? "Вхід..." : "Продовжити з "}</span>
          <span className="text-[20px]">Google</span>
        </p>
      </div>
    </button>
  );
}