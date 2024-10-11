import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Image, StyleSheet, ScrollView, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Check if passwords match
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({
          ...verification,
          state: "success",
        });
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Please try again.",
          state: "failed",
        });
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors[0].longMessage,
        state: "failed",
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image source={images.signUpHero} style={styles.backgroundImage} />

      {/* Content without scrolling */}
      <ScrollView>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.warningText}>
            Please provide your official email address, so it can be shared with
            your employees*
          </Text>

          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Create Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />
          <InputField
            label="Confirm Password"
            placeholder="Re-enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.confirmPassword}
            onChangeText={(value) =>
              setForm({ ...form, confirmPassword: value })
            }
          />
          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
          />
          <OAuth />
          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-6"
          >
            Already have an account?{" "}
            <Text className="text-primary-500">Log In</Text>
          </Link>
        </View>
      </ScrollView>

      <ReactNativeModal
        isVisible={verification.state === "pending"}
        onModalHide={() => {
          if (verification.state === "success") {
            setShowSuccessModal(true);
          }
        }}
      >
        <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
          <Text className="font-JakartaExtraBold text-2xl mb-2">
            Verification
          </Text>
          <Text className="font-Jakarta mb-5">
            We've sent a verification code to {form.email}.
          </Text>
          <InputField
            label={"Code"}
            icon={icons.lock}
            placeholder={"12345"}
            value={verification.code}
            keyboardType="numeric"
            onChangeText={(code) => setVerification({ ...verification, code })}
          />
          {verification.error && (
            <Text className="text-red-500 text-sm mt-1">
              {verification.error}
            </Text>
          )}
          <CustomButton
            title="Verify Email"
            onPress={onPressVerify}
            className="mt-5 bg-primary-1000"
          />
        </View>
      </ReactNativeModal>
      <ReactNativeModal isVisible={showSuccessModal}>
        <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
          <Image
            source={images.check}
            className="w-[110px] h-[110px] mx-auto my-5"
          />
          <Text className="text-3xl font-JakartaBold text-center">
            Verified
          </Text>
          <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
            You have successfully verified your account.
          </Text>
          <CustomButton
            title="Browse Home"
            onPress={() => router.push(`/(root)/(tabs)/home`)}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </View>
  );
};
export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: 150, // Set the height of your background image
    top: 0,
    zIndex: -1, // Make sure the image is behind the scroll content
  },
  warningText: {
    color: "red",
    fontSize: 12, // Adjust size as needed
    marginBottom: 0, // Add some space below the text
  },

  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: 100, // Adjust this to control how much of the image is visible
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 9,
  },
});
