"use server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_DIARY_DESIGN, validateDiaryDesign, type DiaryDesign } from "@/lib/diaryDesign";

export async function getMyDiaryDesign(): Promise<{ design?: DiaryDesign; error?: string }> {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase is not configured." };
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) return { error: "Not authenticated." };
  const { data, error } = await supabase.from("user_diary_designs").select("version,preset_id,cover_color,pattern_id,bookmark_color,bookmark_style,decoration_ids").eq("owner_id", user.id).maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { design: DEFAULT_DIARY_DESIGN };
  return { design: validateDiaryDesign(data) ?? DEFAULT_DIARY_DESIGN };
}

export async function saveMyDiaryDesign(input: DiaryDesign): Promise<{ success?: true; design?: DiaryDesign; error?: string }> {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase is not configured." };
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) return { error: "Not authenticated." };
  const design = validateDiaryDesign(input);
  if (!design) return { error: "Some diary design choices are not supported." };
  const { data, error } = await supabase.from("user_diary_designs").upsert({ owner_id: user.id, ...design, updated_at: new Date().toISOString() }, { onConflict: "owner_id" }).select("version,preset_id,cover_color,pattern_id,bookmark_color,bookmark_style,decoration_ids").single();
  if (error || !data) return { error: error?.message ?? "Could not save your diary design." };
  return { success: true, design: validateDiaryDesign(data) ?? design };
}
