import Link from 'next/link';
import { Shield, Stethoscope, Pill, Users, ArrowRight, ArrowLeft } from 'lucide-react';

const demos = [
  {
    href: '/demo/doctor',
    title: 'Doctor Demo',
    description: 'See how verified doctors create encrypted prescriptions and generate QR codes.',
    icon: Stethoscope,
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-600',
  },
  {
    href: '/demo/pharmacist',
    title: 'Pharmacist Demo',
    description: 'See how pharmacies scan QR codes and verify prescriptions before dispensing.',
    icon: Pill,
    color: 'from-green-500 to-green-600',
    textColor: 'text-green-600',
  },
  {
    href: '/demo/patient',
    title: 'Patient Demo',
    description: 'See how patients view history, verify doctors, and download prescription QR codes.',
    icon: Users,
    color: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-600',
  },
];

export default function DemoHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Samraksha</span>
          </Link>
          <Link
            href="/"
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See How Samraksha Works
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pick a role below to explore a quick walkthrough. No signup needed — just click and learn.
          </p>
        </div>

        <div className="grid gap-6">
          {demos.map((demo) => {
            const Icon = demo.icon;
            return (
              <Link
                key={demo.href}
                href={demo.href}
                className="group flex items-start gap-5 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-gray-200"
              >
                <div className={`bg-gradient-to-br ${demo.color} w-14 h-14 rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{demo.title}</h2>
                  <p className="text-gray-600">{demo.description}</p>
                </div>
                <span className={`flex items-center font-semibold shrink-0 ${demo.textColor} group-hover:underline`}>
                  View
                  <ArrowRight className="h-4 w-4 ml-1" />
                </span>
              </Link>
            );
          })}
        </div>

        <p className="text-center text-gray-500 text-sm mt-10">
          Ready to use Samraksha?{' '}
          <Link href="/#portals" className="text-blue-600 font-semibold hover:underline">
            Get started with a portal
          </Link>
        </p>
      </main>
    </div>
  );
}
