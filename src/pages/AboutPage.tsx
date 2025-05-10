
import SectionHeading from '../components/SectionHeading';

const AboutPage = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="About Me"
          subtitle="My journey, inspiration, and approach to jewelry making"
          className="section-animate"
        />
        
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="rounded-xl overflow-hidden aspect-[3/4] section-animate">
            <img 
              src="https://images.unsplash.com/photo-1613042729592-34cd5fe588e1?auto=format&fit=crop&q=80"
              alt="Portrait of the jewelry artist"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-6 section-animate">
            <h3 className="text-2xl font-bold text-jewelry-dark">
              Melissa Collins
            </h3>
            
            <div className="space-y-4 text-jewelry-gray">
              <p>
                My journey into jewelry making began over a decade ago when I discovered the meditative joy of working with metals and gemstones. What started as a creative outlet quickly evolved into a passionate pursuit of mastering traditional techniques while developing my unique artistic voice.
              </p>
              
              <p>
                I draw inspiration from the natural world—the organic patterns in leaves, the flow of water, the texture of bark. Each piece I create aims to capture a moment of beauty or an emotion, transformed into wearable art that connects with its wearer on a personal level.
              </p>
              
              <p>
                My studio is nestled in the Pacific Northwest, where the changing seasons and dramatic landscapes provide endless inspiration. I work primarily with recycled precious metals and ethically sourced gemstones, honoring my commitment to environmental responsibility.
              </p>
              
              <p>
                Every piece I create is handcrafted using traditional metalsmithing techniques—sawing, forming, soldering, and stone setting. This hands-on approach ensures that each creation carries the subtle marks of its making, a testament to the human touch that machine-made jewelry simply cannot replicate.
              </p>
              
              <p>
                Beyond creating beautiful objects, I find profound fulfillment in knowing my work becomes part of people's most significant moments—engagements, weddings, anniversaries, and personal milestones. The thought that my creations accompany someone through their life's journey is what drives me to pour my heart and skill into every piece.
              </p>
            </div>
          </div>
        </div>
        
        {/* Studio Section */}
        <div className="mt-20 section-animate">
          <SectionHeading
            title="My Studio"
            subtitle="Where imagination meets craftsmanship"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-xl overflow-hidden aspect-square">
              <img 
                src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80"
                alt="Jewelry studio workbench"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden aspect-square">
              <img 
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80"
                alt="Tools and materials"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden aspect-square">
              <img 
                src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&q=80"
                alt="Work in progress"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Process Section */}
        <div className="mt-20 section-animate">
          <SectionHeading
            title="My Process"
            subtitle="From concept to creation"
          />
          
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-4 text-jewelry-gray">
              <p>
                My creative process begins with sketching and ideation, often inspired by natural forms, architectural elements, or emotional concepts. From these initial drawings, I refine the design, considering not just aesthetics but also wearability and durability.
              </p>
              
              <p>
                Once a design is finalized, I select the materials—typically recycled precious metals and ethically sourced gemstones—and begin the fabrication process. This involves cutting, forming, soldering, and finishing the metal components, then setting any stones.
              </p>
              
              <p>
                The final steps involve meticulous polishing and quality checks to ensure each piece meets my standards for both beauty and craftsmanship. Only then is it ready to find its home with someone who will treasure it for years to come.
              </p>
            </div>
            
            <div className="rounded-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80"
                alt="Creating jewelry at workbench"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
