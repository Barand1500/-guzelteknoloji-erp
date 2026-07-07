import {
  ISKONTO_FORMUL_ORNEKLERI,
  SAYI_FORMUL_GRUPLARI,
  type FormulaOrnek,
  type FormulaOrnekGrubu,
} from './formulaYardimci';

function FormulaKart({ ornek }: { ornek: FormulaOrnek }) {
  return (
    <li className="dg-formul-satir">
      <span className="dg-formul-satir-aciklama">{ornek.aciklama}</span>
      <div className="dg-formul-satir-ifade">
        <code className="dg-formul-satir-girdi">{ornek.girdi}</code>
        <span className="dg-formul-satir-ok" aria-hidden>
          →
        </span>
        <output className="dg-formul-satir-sonuc">{ornek.sonuc}</output>
      </div>
    </li>
  );
}

function FormulaGrup({ grup }: { grup: FormulaOrnekGrubu }) {
  return (
    <section className="dg-formul-bolum">
      <h5 className="dg-formul-bolum-baslik">{grup.baslik}</h5>
      <ul className="dg-formul-bolum-liste">
        {grup.ornekler.map((o) => (
          <FormulaKart key={`${grup.id}-${o.girdi}`} ornek={o} />
        ))}
      </ul>
    </section>
  );
}

export function FormulaRehberiIcerik() {
  return (
    <div className="dg-formul-rehber-icerik">
      {SAYI_FORMUL_GRUPLARI.map((grup) => (
        <FormulaGrup key={grup.id} grup={grup} />
      ))}

      <section className="dg-formul-bolum">
        <h5 className="dg-formul-bolum-baslik">İskonto</h5>
        <ul className="dg-formul-bolum-liste">
          {ISKONTO_FORMUL_ORNEKLERI.map((o) => (
            <FormulaKart key={o.girdi} ornek={o} />
          ))}
        </ul>
      </section>
    </div>
  );
}
