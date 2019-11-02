const fragmentShader = `#version 300 es
precision mediump float;
out vec4 fragColor;

uniform vec2 resolution;
uniform float time;
uniform vec4 mouse;
uniform float zoom;
uniform vec3 colorA;
uniform vec3 colorB;
uniform vec3 colorC;
uniform float show;

#define PI  3.1415926
#define PI2 6.2831853

vec2 hash2( vec2 p ) {
	return fract(
        sin(
            vec2(
                dot(p,vec2(44.3,25.7)),
                dot(p,vec2(87.2,54.1)))
           )*4258.4373);
}

vec2 get_mouse(void) {
    float ax = 10.*mouse.x/resolution.x;
    float ay = 10.*mouse.y/resolution.y;  
    return (mouse.xy==vec2(0)) ? vec2(0.3,0.4) : vec2(ax,ay);
}

vec3 normal_color( vec3 x ) {
    return (x-min(x,1.))/(max(x,255.)-min(x,1.));
}

// http://www.iquilezles.org/www/articles/voronoilines/voronoilines.htm
// updated to a vec4 to return hash of object in grid

vec4 voronoi( in vec2 x )
{
    vec2 mouse = get_mouse();
    x.x += mouse.x*.25;
    x.y += mouse.y*.25;
    
	float wave = (time*.7) + mouse.x; // mouse.x; // time;
    
    vec2 n = floor(x);
    vec2 f = fract(x);
	float ox = 0.;
	vec2 mg, mr;

    float md = 8.;
    for( int j=-1; j<=1; j++ )
    for( int i=-1; i<=1; i++ )
    {
        vec2 g = vec2(float(i),float(j));
		vec2 o = hash2( n + g );
        ox = o.x;
        o = .5 + .5 *sin(o * wave + PI2);
        vec2 r = g + o - f;
        float d = dot(r,r);

        if( d<md )
        {
            md = d;
            mr = r;
            mg = g;
        }
    }

    md = 8.;
    for( int j=-2; j<=2; j++ )
    for( int i=-2; i<=2; i++ )
    {
        vec2 g = mg + vec2(float(i),float(j));
		vec2 o = hash2( n + g );
        ox = o.x;
        o = .5 + .5 *sin(o * wave + PI2);
        vec2 r = g + o - f;

        if( dot(mr-r,mr-r)>0.00001 )
        md = min( md, dot( 0.5*(mr+r), normalize(r-mr) ) );
    }

    return vec4( md, mr, ox );
}

void main(void)
{
    vec2 uv = gl_FragCoord.xy/max(resolution.x,resolution.y);
    // for fun effect 
    //uv = abs(uv-vec2(.5,.27));
    vec2 buv = uv;
    uv.y -= time * .05;
    buv.y -= time * .053;
    float back_zoom = zoom * 4.2;
  
    uv *= zoom; 
    buv *= back_zoom; 
  
    vec2 uid = vec2(
        floor(uv.x),
    		floor(uv.x)
    );
    	
    vec4 c = voronoi( uv );
	  vec4 inset = voronoi( uv + vec2(.09,.06));
    vec4 backv = voronoi( buv);
    
	vec3 sle = vec3(c.z - c.x);
    vec3 sne = vec3(c.y - c.x);
    
    vec3 col = vec3(1.);
 	vec3 mate = vec3(1.);
    vec3 dmate = vec3(1.);
    
    // color top layer
    if(c.w<.25){
       mate = normal_color(colorC);
    } else if (c.w<.5) {
       mate = normal_color(colorB);
    } else if (c.w<.75) {
       mate = normal_color(colorA); 
    } else {
        if(show<1.){
            vec2 f=fract(buv.xy * .75 +time)-0.5;
   	        float checkrd = f.x*f.y>0.0?0.5:0.25;
            mate *= checkrd;
        } else {
            mate = vec3( .8 );
        }
       
    }
    
    // color bottom layer
    if(backv.w<.25){
       dmate =vec3(.3);
    } else if (backv.w<.5) {
       dmate = vec3(.5);
    } else if (backv.w<.75) {
       dmate = vec3(.7);
    } else {
       dmate = vec3(.9);
    }
  
    // Stripes from Shane https://www.shadertoy.com/view/XlXBzl
    // his stuff is amazing!
    float diag = clamp(sin((uv.x - uv.y)*PI2*40.)*1. + .95, 0., 1.)*.08 + .08; 
    
 	// background voronoi pattern
	vec3 bkgnd = smoothstep( 0.01, 0.05, backv.x) * dmate;

    float border = 1.-smoothstep( 0.04, 0.05, c.x);
	bkgnd = min(bkgnd,1.-border); // cut the background away from border
	
    // shade which has the inner drop shadow
    vec3 shade = smoothstep( -.01, 0.13, inset.x) * mate - diag;
 	shade = min(shade,1.-border); // cut the shade away from border
    
    // highlights and offsets
    vec3 hglt = clamp(sne + sle, 0., 1.);

    // Check for background pattern
    bkgnd = show < 1. ? vec3(.8) * diag : bkgnd;

    // Layering is hard and still quite frustating.. but this is pretty!
    col = (border*.15) + bkgnd * sne + shade + border * sin(sle*2.4) - hglt*.5;
    
    // Solo variations
    //col = vec3(4.5) * shade * diag + border * sin(sle*2.4);
    
	fragColor = vec4(col,1.);
}
`;

export default fragmentShader;
