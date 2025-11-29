import View from "@/components/ui/view";
import BackgroundMemo from "@/core/components/background-memo";

const ResetPasswordSection = () => {
  return (
    <View>
      <div className="w-full flex min-h-screen justify-center items-center overflow-hidden">
        <div className="absolute w-full h-full z-[-1]">
          <BackgroundMemo />
        </div>
        <p>setup</p>
      </div>
    </View>
  );
};

export default ResetPasswordSection;
