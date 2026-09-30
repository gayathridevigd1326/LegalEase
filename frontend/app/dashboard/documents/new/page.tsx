"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Template, Party } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  FileText,
  Shield,
  Home,
  Briefcase,
  Users,
  FileCode,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  Building,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";

function NewDocumentWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTemplate = searchParams.get("template");

  const { error: toastError, success } = useToast();

  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Form State
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [documentType, setDocumentType] = useState<string>("Non-Disclosure Agreement (NDA)");
  const [templateSearch, setTemplateSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Step 2: Jurisdiction
  const [jurisdictionCountry, setJurisdictionCountry] = useState("United States");
  const [jurisdictionState, setJurisdictionState] = useState("Delaware");
  const [isNotSpecified, setIsNotSpecified] = useState(false);

  // Step 3: Parties
  const [parties, setParties] = useState<Party[]>([
    { name: "", role: "Disclosing Party", company: "", address: "", email: "" },
    { name: "", role: "Receiving Party", company: "", address: "", email: "" },
  ]);

  // Step 4: Terms (dynamic key-values)
  const [terms, setTerms] = useState<Record<string, any>>({});

  // Step 5: Additional instructions
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  // Step 6: Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<string>("");

  useEffect(() => {
    async function loadTemplates() {
      setLoadingTemplates(true);
      const res = await api.templates.list();
      if (res.success && res.data) {
        setTemplates(res.data);
        if (preselectedTemplate) {
          const matched = res.data.find(
            (t) =>
              t.name.toLowerCase() === preselectedTemplate.toLowerCase() ||
              t.id === preselectedTemplate
          );
          if (matched) {
            handleSelectTemplate(matched);
          }
        }
      }
      setLoadingTemplates(false);
    }
    loadTemplates();
  }, [preselectedTemplate]);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setDocumentType(template.name);

    // Set smart default roles for parties based on template
    const nameLower = template.name.toLowerCase();
    if (nameLower.includes("employment") || nameLower.includes("offer")) {
      setParties([
        { name: "", role: "Employer", company: "", address: "", email: "" },
        { name: "", role: "Employee", company: "", address: "", email: "" },
      ]);
    } else if (nameLower.includes("lease") || nameLower.includes("rental")) {
      setParties([
        { name: "", role: "Landlord", company: "", address: "", email: "" },
        { name: "", role: "Tenant", company: "", address: "", email: "" },
      ]);
    } else if (nameLower.includes("freelance") || nameLower.includes("contractor") || nameLower.includes("service")) {
      setParties([
        { name: "", role: "Client / Company", company: "", address: "", email: "" },
        { name: "", role: "Contractor / Service Provider", company: "", address: "", email: "" },
      ]);
    } else {
      setParties([
        { name: "", role: "Disclosing Party", company: "", address: "", email: "" },
        { name: "", role: "Receiving Party", company: "", address: "", email: "" },
      ]);
    }

    // Reset terms
    setTerms({});
  };

  const handleAddParty = () => {
    setParties([
      ...parties,
      {
        name: "",
        role: `Party ${parties.length + 1}`,
        company: "",
        address: "",
        email: "",
      },
    ]);
  };

  const handleRemoveParty = (index: number) => {
    if (parties.length <= 2) {
      toastError("Agreements require at least two parties.");
      return;
    }
    setParties(parties.filter((_, i) => i !== index));
  };

  const handlePartyChange = (index: number, field: keyof Party, val: string) => {
    const updated = [...parties];
    updated[index] = { ...updated[index], [field]: val };
    setParties(updated);
  };

  const handleTermChange = (fieldName: string, val: any) => {
    setTerms((prev) => ({ ...prev, [fieldName]: val }));
  };

  const computedJurisdiction = isNotSpecified
    ? "Not specified"
    : [jurisdictionState, jurisdictionCountry].filter(Boolean).join(", ");

  const handleGenerate = async () => {
    // Validate minimal party details
    if (!parties[0]?.name.trim() || !parties[1]?.name.trim()) {
      toastError("Please enter names for Party 1 and Party 2.");
      setStep(3);
      return;
    }

    setIsGenerating(true);
    setGenerationPhase("Initializing drafting pipeline...");

    try {
      setTimeout(() => setGenerationPhase("Structuring clauses and legal recitals..."), 600);
      setTimeout(() => setGenerationPhase("Validating contractual parameters..."), 1200);
      setTimeout(() => setGenerationPhase("Finalizing document preview..."), 1800);

      const res = await api.documents.generate({
        document_type: documentType,
        template_id: selectedTemplate?.id,
        title: `${documentType} — ${parties[0].name} & ${parties[1].name}`,
        jurisdiction: computedJurisdiction,
        parties: parties.map((p) => ({
          ...p,
          name: p.name.trim() || "Party Name",
          role: p.role.trim() || "Party",
        })),
        terms,
        additional_instructions: additionalInstructions,
        save_as_document: true,
      });

      if (res.success && res.data) {
        success("Legal document generated successfully!");
        router.push(`/dashboard/documents/${res.data.id}`);
      } else {
        toastError(res.error?.message || "Generation failed. Please try again.");
        setIsGenerating(false);
      }
    } catch (err: any) {
      toastError(err.message || "An unexpected error occurred during generation.");
      setIsGenerating(false);
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchCat =
      selectedCategory === "All" ||
      t.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      !templateSearch ||
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(templateSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in-50 duration-300">
      {/* Wizard Header & Stepper */}
      <div className="border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Document Creation Wizard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Draft structured, enforceable legal agreements tailored to your exact jurisdiction and terms.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            Step {step} of 6
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-6 gap-2 pt-2">
          {["Type", "Jurisdiction", "Parties", "Terms", "Instructions", "Review"].map(
            (label, idx) => {
              const stepNum = idx + 1;
              const isDone = stepNum < step;
              const isCurrent = stepNum === step;
              return (
                <div key={label} className="flex flex-col gap-1">
                  <div
                    className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                      isDone
                        ? "bg-emerald-500"
                        : isCurrent
                        ? "bg-blue-600"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                  <span
                    className={`text-[11px] font-medium hidden sm:inline ${
                      isCurrent
                        ? "text-blue-600 dark:text-blue-400 font-semibold"
                        : isDone
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* STEP 1: Document Type */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Step 1 &mdash; Select Document Template
            </h2>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search templates..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="w-full sm:w-64 h-9 text-xs"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2.5 dark:border-slate-800">
            {[
              "All",
              "Employment",
              "Confidentiality",
              "Real Estate",
              "Business",
              "Freelance",
              "Personal",
              "General",
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loadingTemplates ? (
            <div className="p-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
              <p className="mt-2 text-xs text-slate-400">Loading templates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredTemplates.map((t) => {
                const isSelected = selectedTemplate?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTemplate(t)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600 dark:bg-blue-950/40 dark:border-blue-500"
                        : "border-slate-200/90 bg-white hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {t.name}
                          </h3>
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                            {t.category}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Jurisdiction */}
      {step === 2 && (
        <Card className="animate-in fade-in-50 duration-200">
          <CardHeader>
            <CardTitle>Step 2 &mdash; Governing Jurisdiction</CardTitle>
            <p className="text-xs text-slate-500">
              Contract laws vary substantially by jurisdiction. Select where this agreement will be governed.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-amber-50 p-3.5 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
              <span className="font-semibold">Notice:</span> LegalEase adapts terms based on your jurisdiction, but does not invent citations or fabricated statutes. Choose &quot;Not specified&quot; for standard multi-jurisdictional terms.
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="not-specified"
                type="checkbox"
                checked={isNotSpecified}
                onChange={(e) => setIsNotSpecified(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              <label htmlFor="not-specified" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Not specified / General commercial law
              </label>
            </div>

            {!isNotSpecified && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Country
                  </label>
                  <Input
                    value={jurisdictionCountry}
                    onChange={(e) => setJurisdictionCountry(e.target.value)}
                    placeholder="e.g. United States, United Kingdom, Canada"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    State / Province / Region
                  </label>
                  <Input
                    value={jurisdictionState}
                    onChange={(e) => setJurisdictionState(e.target.value)}
                    placeholder="e.g. Delaware, California, Ontario"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Dynamic Parties */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Step 3 &mdash; Parties to Agreement
              </h2>
              <p className="text-xs text-slate-500">
                Define the individuals or entities entering into this contract.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddParty} className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Party
            </Button>
          </div>

          <div className="space-y-4">
            {parties.map((party, idx) => (
              <Card key={idx} className="border-slate-200/90 dark:border-slate-800">
                <CardHeader className="p-4 bg-slate-50/70 border-b border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      Party {idx + 1} ({party.role || "Role"})
                    </span>
                  </div>
                  {parties.length > 2 && (
                    <button
                      onClick={() => handleRemoveParty(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Legal Name *
                    </label>
                    <Input
                      required
                      value={party.name}
                      onChange={(e) => handlePartyChange(idx, "name", e.target.value)}
                      placeholder="e.g. Acme Corporation or Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Role in Agreement *
                    </label>
                    <Input
                      required
                      value={party.role}
                      onChange={(e) => handlePartyChange(idx, "role", e.target.value)}
                      placeholder="e.g. Employer, Disclosing Party, Landlord"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Company / Organization (Optional)
                    </label>
                    <Input
                      value={party.company || ""}
                      onChange={(e) => handlePartyChange(idx, "company", e.target.value)}
                      placeholder="e.g. Acme Global Inc."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Official Email (Optional)
                    </label>
                    <Input
                      type="email"
                      value={party.email || ""}
                      onChange={(e) => handlePartyChange(idx, "email", e.target.value)}
                      placeholder="notices@company.com"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Principal Address / Notice Address (Optional)
                    </label>
                    <Input
                      value={party.address || ""}
                      onChange={(e) => handlePartyChange(idx, "address", e.target.value)}
                      placeholder="Street address, City, State, ZIP"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Smart Dynamic Terms */}
      {step === 4 && (
        <Card className="animate-in fade-in-50 duration-200">
          <CardHeader>
            <CardTitle>Step 4 &mdash; Specific Agreement Terms</CardTitle>
            <p className="text-xs text-slate-500">
              Dynamic contractual parameters for <strong>{documentType}</strong>.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTemplate?.schema?.fields && selectedTemplate.schema.fields.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedTemplate.schema.fields.map((field) => {
                  const currentValue = terms[field.name] ?? field.default_value ?? "";

                  return (
                    <div
                      key={field.name}
                      className={field.type === "textarea" ? "sm:col-span-2" : ""}
                    >
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>

                      {field.type === "textarea" ? (
                        <Textarea
                          value={currentValue}
                          onChange={(e) => handleTermChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                        />
                      ) : field.type === "select" && field.options ? (
                        <select
                          value={currentValue}
                          onChange={(e) => handleTermChange(field.name, e.target.value)}
                          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                          <option value="">Select option...</option>
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "date" ? (
                        <Input
                          type="date"
                          value={currentValue}
                          onChange={(e) => handleTermChange(field.name, e.target.value)}
                        />
                      ) : field.type === "number" ? (
                        <Input
                          type="number"
                          value={currentValue}
                          onChange={(e) => handleTermChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                        />
                      ) : (
                        <Input
                          type="text"
                          value={currentValue}
                          onChange={(e) => handleTermChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Fallback standard terms */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Core Objective or Purpose
                  </label>
                  <Textarea
                    value={terms["purpose"] || ""}
                    onChange={(e) => handleTermChange("purpose", e.target.value)}
                    placeholder="Describe what the parties are accomplishing or protecting..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Duration / Effective Term
                    </label>
                    <Input
                      value={terms["duration"] || ""}
                      onChange={(e) => handleTermChange("duration", e.target.value)}
                      placeholder="e.g. 1 Year, 2 Years, or Ongoing"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Payment / Consideration (If applicable)
                    </label>
                    <Input
                      value={terms["compensation"] || ""}
                      onChange={(e) => handleTermChange("compensation", e.target.value)}
                      placeholder="e.g. $5,000 upon completion or N/A"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* STEP 5: Additional Natural Language Instructions */}
      {step === 5 && (
        <Card className="animate-in fade-in-50 duration-200">
          <CardHeader>
            <CardTitle>Step 5 &mdash; Additional Instructions</CardTitle>
            <p className="text-xs text-slate-500">
              Provide any custom clauses, specific constraints, or special phrasing you want incorporated into the draft.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Anything else you want included?
              </label>
              <Textarea
                rows={5}
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="e.g., 'Include a non-solicitation clause for 12 months post-termination', 'Require mediation before binding arbitration', or 'Make sure intellectual property assigns unconditionally upon invoice payment'..."
              />
            </div>
            <p className="text-xs text-slate-400">
              Our AI engine will parse your natural-language guidelines and weave them into the formal legal sections.
            </p>
          </CardContent>
        </Card>
      )}

      {/* STEP 6: Review & Final Generate */}
      {step === 6 && (
        <Card className="animate-in fade-in-50 duration-200 border-blue-200 dark:border-blue-900 shadow-md">
          <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Step 6 &mdash; Review & Generate Contract
            </CardTitle>
            <p className="text-xs text-slate-500">
              Verify your parameters before invoking the AI drafting engine.
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Document Type
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {documentType}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Governing Jurisdiction
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {computedJurisdiction}
                </span>
              </div>
            </div>

            {/* Parties Summary */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Contracting Parties
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {parties.map((p, i) => (
                  <div key={i} className="space-y-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {p.name || `[Unnamed Party ${i + 1}]`} ({p.role})
                    </p>
                    {p.company && <p className="text-slate-500">Company: {p.company}</p>}
                    {p.email && <p className="text-slate-500">Email: {p.email}</p>}
                    {p.address && <p className="text-slate-500 truncate">Address: {p.address}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Terms Summary */}
            {Object.keys(terms).length > 0 && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Key Terms Provided
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  {Object.entries(terms).map(([k, v]) => (
                    <div key={k} className="truncate">
                      <span className="font-medium capitalize">{k.replace("_", " ")}: </span>
                      <span>{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {additionalInstructions && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Custom Instructions
                </h4>
                <p className="text-slate-600 dark:text-slate-300 italic">
                  &quot;{additionalInstructions}&quot;
                </p>
              </div>
            )}

            {/* Legal Safety Notice */}
            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Disclaimer:</strong> LegalEase generates informational drafts. After generation, you can edit clauses, run AI rewrites, and export as PDF/DOCX.
              </span>
            </div>

            {/* Generation Progress Indicator (Section 42) */}
            {isGenerating && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center gap-3 animate-pulse">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div className="text-xs">
                  <p className="font-semibold text-blue-900 dark:text-blue-200">
                    Generating your document...
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">{generationPhase}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Wizard Footer Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        {step > 1 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep(step - 1)}
            disabled={isGenerating}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 6 ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (step === 3 && (!parties[0]?.name.trim() || !parties[1]?.name.trim())) {
                toastError("Please enter names for Party 1 and Party 2.");
                return;
              }
              setStep(step + 1);
            }}
            className="gap-1.5 shadow-sm"
          >
            Next Step
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={handleGenerate}
            isLoading={isGenerating}
            className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md font-semibold text-sm"
          >
            <Sparkles className="h-4 w-4" />
            Generate Document with AI
          </Button>
        )}
      </div>
    </div>
  );
}

export default function NewDocumentWizardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    }>
      <NewDocumentWizardContent />
    </Suspense>
  );
}
