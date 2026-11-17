import {useEffect, useState} from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {router} from "expo-router";

import {DiscoverSectionHeader} from "@/component/DiscoverSectionHeader";
import InterestContainer from "../component/InterestContainer";
import {useTheme} from "@/hooks/use-theme";
import {
    getAvailableInterests,
    getStudentProfile,
    updateStudentProfile,
    type InterestResponse,
    type StudentProfile,
} from "@/services/api";
import {getSession} from "@/services/auth";

export default function Account() {
    const {colors} = useTheme();
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [availableInterests, setAvailableInterests] = useState<InterestResponse[]>([]);
    const [displayName, setDisplayName] = useState("");
    const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [signedOut, setSignedOut] = useState(false);

    useEffect(() => {
        let isActive = true;

        async function loadProfile() {
            try {
                const session = await getSession();
                if (!session) {
                    if (isActive) {
                        setSignedOut(true);
                        setLoading(false);
                    }
                    return;
                }

                const [loadedProfile, interests] = await Promise.all([
                    getStudentProfile(session.student_id),
                    getAvailableInterests(),
                ]);
                if (!isActive) return;

                setProfile(loadedProfile);
                setDisplayName(loadedProfile.display_name);
                setSelectedInterestIds(
                    loadedProfile.interests.map((interest) => interest.interest_id),
                );
                setAvailableInterests(interests);
            } catch (loadError: unknown) {
                if (isActive) {
                    setError(
                        loadError instanceof Error
                            ? loadError.message
                            : "Could not load your profile.",
                    );
                }
            } finally {
                if (isActive) setLoading(false);
            }
        }

        void loadProfile();
        return () => {
            isActive = false;
        };
    }, []);

    function toggleInterest(interestId: number) {
        setSelectedInterestIds((current) =>
            current.includes(interestId)
                ? current.filter((id) => id !== interestId)
                : [...current, interestId],
        );
        setSuccess("");
    }

    async function saveProfile() {
        if (!profile) return;
        const normalizedName = displayName.trim();
        if (!normalizedName) {
            setError("Display name is required.");
            return;
        }

        setError("");
        setSuccess("");
        setSaving(true);
        try {
            const updatedProfile = await updateStudentProfile(profile.student_id, {
                display_name: normalizedName,
                interest_ids: selectedInterestIds,
            });
            setProfile(updatedProfile);
            setDisplayName(updatedProfile.display_name);
            setSelectedInterestIds(
                updatedProfile.interests.map((interest) => interest.interest_id),
            );
            setSuccess("Profile and interests saved.");
        } catch (saveError: unknown) {
            setError(
                saveError instanceof Error
                    ? saveError.message
                    : "Could not save your profile.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <SafeAreaView
            edges={["top"]}
            style={[styles.container, {backgroundColor: colors.background}]}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <DiscoverSectionHeader text="Account" textSize="xxxl"/>

                {loading ? (
                    <ActivityIndicator color={colors.accent}/>
                ) : signedOut ? (
                    <View style={[styles.card, {backgroundColor: colors.surface, borderColor: colors.border}]}>
                        <Text style={{color: colors.baseFont}}>Log in to view and manage your profile.</Text>
                        <Pressable
                            onPress={() => router.replace("/Login")}
                            style={[styles.button, {backgroundColor: colors.accent}]}
                        >
                            <Text style={[styles.buttonText, {color: colors.onAccent}]}>Log In</Text>
                        </Pressable>
                    </View>
                ) : profile ? (
                    <>
                        <View style={[styles.card, {backgroundColor: colors.surface, borderColor: colors.border}]}>
                            <DiscoverSectionHeader text="Profile" textSize="xl"/>
                            <Text style={[styles.label, {color: colors.muted}]}>Display name</Text>
                            <TextInput
                                accessibilityLabel="Display name"
                                value={displayName}
                                onChangeText={(value) => {
                                    setDisplayName(value);
                                    setSuccess("");
                                }}
                                editable={!saving}
                                maxLength={100}
                                placeholder="Display name"
                                placeholderTextColor={colors.placeholder}
                                style={[
                                    styles.input,
                                    {
                                        color: colors.baseFont,
                                        borderColor: colors.border,
                                        backgroundColor: colors.input,
                                    },
                                ]}
                            />
                            <Text style={[styles.label, {color: colors.muted}]}>Email</Text>
                            <Text style={[styles.value, {color: colors.baseFont}]}>{profile.email}</Text>
                            <Text style={[styles.label, {color: colors.muted}]}>University</Text>
                            <Text style={[styles.value, {color: colors.baseFont}]}>{profile.university}</Text>
                        </View>

                        <InterestContainer
                            interests={availableInterests}
                            selectedInterestIds={selectedInterestIds}
                            onToggle={toggleInterest}
                            disabled={saving}
                        />

                        {error ? <Text style={styles.error}>{error}</Text> : null}
                        {success ? <Text style={styles.success}>{success}</Text> : null}

                        <Pressable
                            accessibilityRole="button"
                            disabled={saving}
                            onPress={saveProfile}
                            style={[
                                styles.button,
                                {backgroundColor: colors.accent, opacity: saving ? 0.6 : 1},
                            ]}
                        >
                            {saving ? (
                                <ActivityIndicator color={colors.onAccent}/>
                            ) : (
                                <Text style={[styles.buttonText, {color: colors.onAccent}]}>
                                    Save Profile
                                </Text>
                            )}
                        </Pressable>
                    </>
                ) : (
                    <Text style={styles.error}>{error || "Profile is unavailable."}</Text>
                )}

                {error && !profile && !signedOut && !loading ? (
                    <Text style={[styles.error, {color: colors.muted}]}>
                        Check your connection and try opening this screen again.
                    </Text>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    content: {gap: 16, paddingHorizontal: 16, paddingBottom: 32},
    card: {
        width: "100%",
        borderWidth: 1,
        borderRadius: 24,
        padding: 16,
        gap: 8,
    },
    label: {fontSize: 14, marginTop: 4},
    value: {fontSize: 16, paddingHorizontal: 4, paddingBottom: 4},
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    button: {
        alignItems: "center",
        borderRadius: 999,
        paddingVertical: 14,
    },
    buttonText: {fontSize: 16, fontWeight: "700"},
    error: {color: "#D14343", fontWeight: "600"},
    success: {color: "#2E8B57", fontWeight: "600"},
});
