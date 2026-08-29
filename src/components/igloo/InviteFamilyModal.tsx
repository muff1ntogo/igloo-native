import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Share,
} from "react-native";
import { X, Share2, Mail } from "lucide-react-native";
import { useIgloo } from "@lib/igloo-store";

export const APP_DOWNLOAD_URL = "https://example.com/igloo-app";

type InvitePath = "link" | "email";

interface InviteFamilyModalProps {
  visible: boolean;
  onClose: () => void;
}

export function InviteFamilyModal({ visible, onClose }: InviteFamilyModalProps) {
  const { inviteFamily } = useIgloo();
  const [path, setPath] = useState<InvitePath | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRelation, setInviteRelation] = useState("");
  const [inviting, setInviting] = useState(false);

  const reset = () => {
    setPath(null);
    setInviteEmail("");
    setInviteRelation("");
  };

  const handleInvite = async () => {
    const email = inviteEmail.trim();
    const relation = inviteRelation.trim();
    if (!email || !relation) return;
    setInviting(true);
    const result = await inviteFamily(email, relation);
    setInviting(false);
    if (result.success) {
      reset();
      onClose();
    }
  };

  const handleShareLink = async () => {
    await Share.share({
      message:
        `Join me on Igloo — a personal health tracker.\nDownload: ${APP_DOWNLOAD_URL}\n\nNote: sharing this link only gets them the app. To create a family connection, they'll need to sign up and then you'll send an invite from within the app.`,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-card rounded-t-[32px] p-6 pb-10 max-h-[70%] border-t border-border shadow-2xl">
          <View className="flex-row items-center justify-between pb-4 border-b border-border/60">
            <Text className="font-serif text-xl font-bold text-foreground">
              Invite a family member
            </Text>
            <TouchableOpacity
              onPress={() => { reset(); onClose(); }}
              className="p-1 rounded-full bg-muted/40"
            >
              <X size={20} color="#5C7E8C" />
            </TouchableOpacity>
          </View>

          {path === null && (
            <View className="py-5 gap-3">
              <TouchableOpacity
                onPress={() => setPath("email")}
                className="flex-row items-center gap-3 bg-primary-tint rounded-2xl p-4 active:opacity-90"
              >
                <View className="size-10 rounded-full bg-primary items-center justify-center">
                  <Mail size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="font-sans text-sm font-bold text-foreground">Enter email</Text>
                  <Text className="font-sans text-xs text-muted-foreground">
                    Send an invite directly to their email address
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShareLink}
                className="flex-row items-center gap-3 bg-primary-tint rounded-2xl p-4 active:opacity-90"
              >
                <View className="size-10 rounded-full bg-primary items-center justify-center">
                  <Share2 size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="font-sans text-sm font-bold text-foreground">Share a link</Text>
                  <Text className="font-sans text-xs text-muted-foreground">
                    Share an app download link via any app
                  </Text>
                </View>
              </TouchableOpacity>

              <Text className="font-sans text-xs text-muted-foreground text-center px-4">
                Note: sharing a link only gets them the app. It doesn&apos;t create a family connection — you&apos;ll still need to enter their email after they sign up.
              </Text>
            </View>
          )}

          {path === "email" && (
            <View className="py-4 gap-3">
              <TextInput
                className="rounded-xl bg-input p-3 font-sans text-sm text-foreground"
                placeholder="Email address"
                placeholderTextColor="#718096"
                value={inviteEmail}
                onChangeText={setInviteEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                className="rounded-xl bg-input p-3 font-sans text-sm text-foreground"
                placeholder="Relationship (e.g. Daughter)"
                placeholderTextColor="#718096"
                value={inviteRelation}
                onChangeText={setInviteRelation}
              />
              <TouchableOpacity
                onPress={handleInvite}
                disabled={inviting}
                className="rounded-2xl bg-sun p-card-pad flex-row items-center justify-center gap-2 active:opacity-90"
              >
                <Text className="font-sans text-sm font-bold text-foreground">
                  {inviting ? "Sending…" : "Send invite"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPath(null)} className="items-center py-2">
                <Text className="font-sans text-xs text-muted-foreground">Back to options</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
