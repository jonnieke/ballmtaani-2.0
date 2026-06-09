import { useState } from "react";
import { supabase } from "../lib/supabase";
import { X, Plus, Trash2 } from "lucide-react";

interface PollCreationModalProps {
  fanZoneId: string;
  isOpen: boolean;
  onClose: () => void;
  onPollCreated?: () => void;
}

export default function PollCreationModal({
  fanZoneId,
  isOpen,
  onClose,
  onPollCreated,
}: PollCreationModalProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<{ id: string; text: string }[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
  ]);
  const [duration, setDuration] = useState("24"); // hours
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddOption = () => {
    const newId = Math.max(...options.map((o) => parseInt(o.id))) + 1;
    setOptions([...options, { id: newId.toString(), text: "" }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((o) => o.id !== id));
    }
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const handleCreatePoll = async () => {
    setError("");

    // Validation
    if (!question.trim()) {
      setError("Question is required");
      return;
    }

    const filledOptions = options.filter((o) => o.text.trim());
    if (filledOptions.length < 2) {
      setError("At least 2 options are required");
      return;
    }

    setLoading(true);

    try {
      const closesAt = new Date();
      closesAt.setHours(closesAt.getHours() + parseInt(duration));

      const votes: Record<string, number> = {};
      filledOptions.forEach((opt) => {
        votes[opt.id] = 0;
      });

      const { error: insertError } = await supabase
        .from("fan_zone_polls")
        .insert({
          fan_zone_id: fanZoneId,
          question: question.trim(),
          options: filledOptions,
          votes: votes,
          closes_at: closesAt.toISOString(),
          status: "active",
        });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      // Reset form
      setQuestion("");
      setOptions([
        { id: "1", text: "" },
        { id: "2", text: "" },
      ]);
      setDuration("24");

      onPollCreated?.();
      onClose();
    } catch (err) {
      setError("Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-2xl border border-white/10 bg-[#0B0B0B] w-full max-w-md mx-4 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black uppercase tracking-widest text-white">
            Create Poll
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Question Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
            Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., Best XI Formation?"
            maxLength={100}
            disabled={loading}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-white/30 focus:outline-none disabled:opacity-50"
          />
          <p className="text-[9px] text-white/25 mt-1">
            {question.length}/100
          </p>
        </div>

        {/* Options */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
            Options
          </label>
          <div className="space-y-2">
            {options.map((option, idx) => (
              <div key={option.id} className="flex gap-2">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  maxLength={50}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/20 focus:border-white/30 focus:outline-none disabled:opacity-50"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => handleRemoveOption(option.id)}
                    disabled={loading}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 5 && (
            <button
              onClick={handleAddOption}
              disabled={loading}
              className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#FFD700] hover:text-[#FFA500] transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Option
            </button>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
            Closes In
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none disabled:opacity-50"
          >
            <option value="1">1 hour</option>
            <option value="4">4 hours</option>
            <option value="24">24 hours (1 day)</option>
            <option value="168">7 days</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreatePoll}
            disabled={loading || !question.trim()}
            className="flex-1 rounded-lg bg-[#FFD700] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-black hover:bg-[#FFA500] transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Poll"}
          </button>
        </div>
      </div>
    </div>
  );
}
