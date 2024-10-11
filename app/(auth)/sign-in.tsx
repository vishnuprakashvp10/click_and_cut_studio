import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    if (!form.email || !form.password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      const errorMessage =
        err.errors && err.errors.length > 0
          ? err.errors[0].longMessage
          : "An unknown error occurred. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  }, [isLoaded, signIn, form.email, form.password, setActive]);

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image source={images.signUpHero} style={styles.backgroundImage} />

      {/* Content without scrolling */}
      <View style={styles.contentContainer}>
        <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
          Welcome Back ✂️
        </Text>
      </View>

      <View className="p-5">
        <InputField
          label="Email"
          placeholder="Enter email"
          icon={icons.email}
          textContentType="emailAddress"
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
        />

        <InputField
          label="Password"
          placeholder="Enter password"
          icon={icons.lock}
          secureTextEntry={true}
          textContentType="password"
          value={form.password}
          onChangeText={(value) => setForm({ ...form, password: value })}
        />

        <CustomButton
          title="Sign In"
          onPress={onSignInPress}
          className="mt-6"
        />

        <OAuth />

        <Link
          href="/sign-up"
          className="text-lg text-center text-general-200 mt-10"
        >
          Don't have an account?{" "}
          <Text className="text-primary-500">Sign Up</Text>
        </Link>
      </View>
    </View>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: 250, // Set the height of your background image
    top: 0,
    zIndex: -1, // Make sure the image is behind the scroll content
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: 200, // Adjust this to control how much of the image is visible
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
});
