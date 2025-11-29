import dynamic from "next/dynamic";
import { useMemo } from "react";

const Layer = dynamic(() => import("@/components/FloatingLines"), {
  ssr: false,
});

const BackgroundMemo = () => {
  const MemoLayer = useMemo(
    () => (
      <Layer
        enabledWaves={["top", "middle", "bottom"]}
        lineCount={[5, 10, 15]}
        lineDistance={[6, 4, 2]}
        bendRadius={5.0}
        bendStrength={-0.5}
        interactive={true}
        parallax={true}
      />
    ),
    []
  );

  return <>{MemoLayer}</>;
};

export default BackgroundMemo;
