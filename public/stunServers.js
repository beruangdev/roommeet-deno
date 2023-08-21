let stunServers = [
  "stun:stun.relay.metered.ca:80",
  "stun:stun01.sipphone.com:3478",
  "stun:stun.sipglobalphone.com:3478",
  "stun:stun.ozekiphone.com:3478",
  "stun:stun.budgetphone.nl:3478",
  "stun:iphone-stun.strato-iphone.de:3478",
  "stun:stun.linphone.org:3478",
  "stun:stun.phone.com:3478",
  "stun:stun.phoneserve.com:3478",
  "stun:stun.clickphone.ro:3478",
  "stun:stun.localphone.com:3478",
  "stun:stun.magyarphone.eu:3478",
  "stun:stun.nexphone.ch:3478",
  "stun:stun.l.google.com:19302",
  "stun:stun1.l.google.com:19302",
  "stun:stun2.l.google.com:19302",
  "stun:stun3.l.google.com:19302",
  "stun:stun4.l.google.com:19302",
  "stun:stun1.l.google.com:19305",
  "stun:stun2.l.google.com:19305",
  "stun:stun3.l.google.com:19305",
  "stun:stun4.l.google.com:19305",
  "stun:23.21.150.121:3478",
  "stun:numb.viagenie.ca:3478",
  "stun:s1.taraba.net:3478",
  "stun:s2.taraba.net:3478",
  "stun:stun.12connect.com:3478",
  "stun:stun.12voip.com:3478",
  "stun:stun.1und1.de:3478",
  "stun:stun.2talk.co.nz:3478",
  "stun:stun.2talk.com:3478",
  "stun:stun.3clogic.com:3478",
  "stun:stun.3cx.com:3478",
  "stun:stun.a-mm.tv:3478",
  "stun:stun.aa.net.uk:3478",
  "stun:stun.acrobits.cz:3478",
  "stun:stun.actionvoip.com:3478",
  "stun:stun.advfn.com:3478",
  "stun:stun.aeta-audio.com:3478",
  "stun:stun.aeta.com:3478",
  "stun:stun.alltel.com.au:3478",
  "stun:stun.altar.com.pl:3478",
  "stun:stun.annatel.net:3478",
  "stun:stun.antisip.com:3478",
  "stun:stun.arbuz.ru:3478",
  "stun:stun.avigora.com:3478",
  "stun:stun.avigora.fr:3478",
  "stun:stun.awa-shima.com:3478",
  "stun:stun.awt.be:3478",
  "stun:stun.b2b2c.ca:3478",
  "stun:stun.bahnhof.net:3478",
  "stun:stun.barracuda.com:3478",
  "stun:stun.bluesip.net:3478",
  "stun:stun.bmwgs.cz:3478",
  "stun:stun.botonakis.com:3478",
  "stun:stun.budgetsip.com:3478",
  "stun:stun.cablenet-as.net:3478",
  "stun:stun.callromania.ro:3478",
  "stun:stun.callwithus.com:3478",
  "stun:stun.cbsys.net:3478",
  "stun:stun.chathelp.ru:3478",
  "stun:stun.cheapvoip.com:3478",
  "stun:stun.ciktel.com:3478",
  "stun:stun.cloopen.com:3478",
  "stun:stun.colouredlines.com.au:3478",
  "stun:stun.comfi.com:3478",
  "stun:stun.commpeak.com:3478",
  "stun:stun.comtube.com:3478",
  "stun:stun.comtube.ru:3478",
  "stun:stun.cope.es:3478",
  "stun:stun.counterpath.com:3478",
  "stun:stun.counterpath.net:3478",
  "stun:stun.cryptonit.net:3478",
  "stun:stun.darioflaccovio.it:3478",
  "stun:stun.datamanagement.it:3478",
  "stun:stun.dcalling.de:3478",
  "stun:stun.decanet.fr:3478",
  "stun:stun.demos.ru:3478",
  "stun:stun.develz.org:3478",
  "stun:stun.dingaling.ca:3478",
  "stun:stun.doublerobotics.com:3478",
  "stun:stun.drogon.net:3478",
  "stun:stun.duocom.es:3478",
  "stun:stun.dus.net:3478",
  "stun:stun.e-fon.ch:3478",
  "stun:stun.easybell.de:3478",
  "stun:stun.easycall.pl:3478",
  "stun:stun.easyvoip.com:3478",
  "stun:stun.efficace-factory.com:3478",
  "stun:stun.einsundeins.com:3478",
  "stun:stun.einsundeins.de:3478",
  "stun:stun.ekiga.net:3478",
  "stun:stun.epygi.com:3478",
  "stun:stun.etoilediese.fr:3478",
  "stun:stun.eyeball.com:3478",
  "stun:stun.faktortel.com.au:3478",
  "stun:stun.freecall.com:3478",
  "stun:stun.freeswitch.org:3478",
  "stun:stun.freevoipdeal.com:3478",
  "stun:stun.fuzemeeting.com:3478",
  "stun:stun.gmx.de:3478",
  "stun:stun.gmx.net:3478",
  "stun:stun.gradwell.com:3478",
  "stun:stun.halonet.pl:3478",
  "stun:stun.hellonanu.com:3478",
  "stun:stun.hoiio.com:3478",
  "stun:stun.hosteurope.de:3478",
  "stun:stun.ideasip.com:3478",
  "stun:stun.imesh.com:3478",
  "stun:stun.infra.net:3478",
  "stun:stun.internetcalls.com:3478",
  "stun:stun.intervoip.com:3478",
  "stun:stun.ipcomms.net:3478",
  "stun:stun.ipfire.org:3478",
  "stun:stun.ippi.fr:3478",
  "stun:stun.ipshka.com:3478",
  "stun:stun.iptel.org:3478",
  "stun:stun.irian.at:3478",
  "stun:stun.it1.hr:3478",
  "stun:stun.ivao.aero:3478",
  "stun:stun.jappix.com:3478",
  "stun:stun.jumblo.com:3478",
  "stun:stun.justvoip.com:3478",
  "stun:stun.kanet.ru:3478",
  "stun:stun.kiwilink.co.nz:3478",
  "stun:stun.kundenserver.de:3478",
  "stun:stun.linea7.net:3478",
  "stun:stun.liveo.fr:3478",
  "stun:stun.lowratevoip.com:3478",
  "stun:stun.lugosoft.com:3478",
  "stun:stun.lundimatin.fr:3478",
  "stun:stun.magnet.ie:3478",
  "stun:stun.manle.com:3478",
  "stun:stun.mgn.ru:3478",
  "stun:stun.mit.de:3478",
  "stun:stun.mitake.com.tw:3478",
  "stun:stun.miwifi.com:3478",
  "stun:stun.modulus.gr:3478",
  "stun:stun.mozcom.com:3478",
  "stun:stun.myvoiptraffic.com:3478",
  "stun:stun.mywatson.it:3478",
  "stun:stun.nas.net:3478",
  "stun:stun.neotel.co.za:3478",
  "stun:stun.netappel.com:3478",
  "stun:stun.netappel.fr:3478",
  "stun:stun.netgsm.com.tr:3478",
  "stun:stun.nfon.net:3478",
  "stun:stun.noblogs.org:3478",
  "stun:stun.noc.ams-ix.net:3478",
  "stun:stun.node4.co.uk:3478",
  "stun:stun.nonoh.net:3478",
  "stun:stun.nottingham.ac.uk:3478",
  "stun:stun.nova.is:3478",
  "stun:stun.nventure.com:3478",
  "stun:stun.on.net.mk:3478",
  "stun:stun.ooma.com:3478",
  "stun:stun.ooonet.ru:3478",
  "stun:stun.oriontelekom.rs:3478",
  "stun:stun.outland-net.de:3478",
  "stun:stun.patlive.com:3478",
  "stun:stun.personal-voip.de:3478",
  "stun:stun.petcube.com:3478",

  "stun:stun.pjsip.org:3478",
  "stun:stun.poivy.com:3478",
  "stun:stun.powerpbx.org:3478",
  "stun:stun.powervoip.com:3478",
  "stun:stun.ppdi.com:3478",
  "stun:stun.prizee.com:3478",
  "stun:stun.qq.com:3478",
  "stun:stun.qvod.com:3478",
  "stun:stun.rackco.com:3478",
  "stun:stun.rapidnet.de:3478",
  "stun:stun.rb-net.com:3478",
  "stun:stun.refint.net:3478",
  "stun:stun.remote-learner.net:3478",
  "stun:stun.rixtelecom.se:3478",
  "stun:stun.rockenstein.de:3478",
  "stun:stun.rolmail.net:3478",
  "stun:stun.rounds.com:3478",
  "stun:stun.rynga.com:3478",
  "stun:stun.samsungsmartcam.com:3478",
  "stun:stun.schlund.de:3478",
  "stun:stun.services.mozilla.com:3478",
  "stun:stun.sigmavoip.com:3478",
  "stun:stun.sip.us:3478",
  "stun:stun.sipdiscount.com:3478",
  "stun:stun.siplogin.de:3478",
  "stun:stun.sipnet.net:3478",
  "stun:stun.sipnet.ru:3478",
  "stun:stun.siportal.it:3478",
  "stun:stun.sippeer.dk:3478",
  "stun:stun.siptraffic.com:3478",
  "stun:stun.skylink.ru:3478",
  "stun:stun.sma.de:3478",
  "stun:stun.smartvoip.com:3478",
  "stun:stun.smsdiscount.com:3478",
  "stun:stun.snafu.de:3478",
  "stun:stun.softjoys.com:3478",
  "stun:stun.solcon.nl:3478",
  "stun:stun.solnet.ch:3478",
  "stun:stun.sonetel.com:3478",
  "stun:stun.sonetel.net:3478",
  "stun:stun.sovtest.ru:3478",
  "stun:stun.speedy.com.ar:3478",
  "stun:stun.spokn.com:3478",
  "stun:stun.srce.hr:3478",
  "stun:stun.ssl7.net:3478",
  "stun:stun.stunprotocol.org:3478",
  "stun:stun.symform.com:3478",
  "stun:stun.symplicity.com:3478",
  "stun:stun.sysadminman.net:3478",
  "stun:stun.t-online.de:3478",
  "stun:stun.tagan.ru:3478",
  "stun:stun.tatneft.ru:3478",
  "stun:stun.teachercreated.com:3478",
  "stun:stun.tel.lu:3478",
  "stun:stun.telbo.com:3478",
  "stun:stun.telefacil.com:3478",
  "stun:stun.tis-dialog.ru:3478",
  "stun:stun.tng.de:3478",
  "stun:stun.twt.it:3478",
  "stun:stun.u-blox.com:3478",
  "stun:stun.ucallweconn.net:3478",
  "stun:stun.ucsb.edu:3478",
  "stun:stun.ucw.cz:3478",
  "stun:stun.uls.co.za:3478",
  "stun:stun.unseen.is:3478",
  "stun:stun.usfamily.net:3478",
  "stun:stun.veoh.com:3478",
  "stun:stun.vidyo.com:3478",
  "stun:stun.vipgroup.net:3478",
  "stun:stun.virtual-call.com:3478",
  "stun:stun.viva.gr:3478",
  "stun:stun.vivox.com:3478",
  "stun:stun.vline.com:3478",
  "stun:stun.vo.lu:3478",
  "stun:stun.vodafone.ro:3478",
  "stun:stun.voicetrading.com:3478",
  "stun:stun.voip.aebc.com:3478",
  "stun:stun.voip.blackberry.com:3478",
  "stun:stun.voip.eutelia.it:3478",
  "stun:stun.voiparound.com:3478",
  "stun:stun.voipblast.com:3478",
  "stun:stun.voipbuster.com:3478",
  "stun:stun.voipbusterpro.com:3478",
  "stun:stun.voipcheap.co.uk:3478",
  "stun:stun.voipcheap.com:3478",
  "stun:stun.voipfibre.com:3478",
  "stun:stun.voipgain.com:3478",
  "stun:stun.voipgate.com:3478",
  "stun:stun.voipinfocenter.com:3478",
  "stun:stun.voipplanet.nl:3478",
  "stun:stun.voippro.com:3478",
  "stun:stun.voipraider.com:3478",
  "stun:stun.voipstunt.com:3478",
  "stun:stun.voipwise.com:3478",
  "stun:stun.voipzoom.com:3478",
  "stun:stun.vopium.com:3478",
  "stun:stun.voxgratia.org:3478",
  "stun:stun.voxox.com:3478",
  "stun:stun.voys.nl:3478",
  "stun:stun.voztele.com:3478",
  "stun:stun.vyke.com:3478",
  "stun:stun.webcalldirect.com:3478",
  "stun:stun.whoi.edu:3478",
  "stun:stun.wifirst.net:3478",
  "stun:stun.wwdl.net:3478",
  "stun:stun.xs4all.nl:3478",
  "stun:stun.xtratelecom.es:3478",
  "stun:stun.yesss.at:3478",
  "stun:stun.zadarma.com:3478",
  "stun:stun.zadv.com:3478",
  "stun:stun.zoiper.com:3478",
  "stun:stun1.faktortel.com.au:3478",
  "stun:stun1.voiceeclipse.net:3478",
  "stun:stunserver.org:3478",
  "stun:stun.nextcloud.com:443",
  "stun:relay.webwormhole.io",
  "stun:124.64.206.224:8800",
  "stun:relay.webwormhole.io:3478",
  "stun:s1.voipstation.jp:3478",
  "stun:s2.voipstation.jp:3478",
  "stun:stun-eu.3cx.com:3478",
  "stun:stun-us.3cx.com:3478",
  "stun:stun.1-voip.com:3478",
  "stun:stun.1cbit.ru:3478",
  "stun:stun.3deluxe.de:3478",
  "stun:stun.3wayint.com:3478",
  "stun:stun.5sn.com:3478",
  "stun:stun.aaisp.co.uk:3478",
  "stun:stun.aceweb.com:3478",
  "stun:stun.acquageraci.it:3478",
  "stun:stun.acronis.com:3478",
  "stun:stun.alberon.cz:3478",
  "stun:stun.allflac.com:3478",
  "stun:stun.alphacron.de:3478",
  "stun:stun.alpirsbacher.de:3478",
  "stun:stun.anlx.net:3478",
  "stun:stun.arkh-edu.ru:3478",
  "stun:stun.atagverwarming.nl:3478",
  "stun:stun.autosystem.com:3478",
  "stun:stun.avoxi.com:3478",
  "stun:stun.axeos.nl:3478",
  "stun:stun.axialys.net:3478",
  "stun:stun.babelforce.com:3478",
  "stun:stun.baltmannsweiler.de:3478",
  "stun:stun.bandyer.com:3478",
  "stun:stun.bau-ha.us:3478",
  "stun:stun.bcs2005.net:3478",
  "stun:stun.bearstech.com:3478",
  "stun:stun.beebeetle.com:3478",
  "stun:stun.bergophor.de:3478",
  "stun:stun.bernardoprovenzano.net:3478",
  "stun:stun.bernies-bergwelt.com:3478",
  "stun:stun.bethesda.net:3478",
  "stun:stun.bitburger.de:3478",
  "stun:stun.bridesbay.com:3478",
  "stun:stun.business-isp.nl:3478",
  "stun:stun.carlovizzini.it:3478",
  "stun:stun.cdosea.org:3478",
  "stun:stun.cellmail.com:3478",
  "stun:stun.chaosmos.de:3478",
  "stun:stun.chatous.com:3478",
  "stun:stun.chewinggum.nl:3478",
  "stun:stun.cibercloud.com.br:3478",
  "stun:stun.coffee-sen.com:3478",
  "stun:stun.comrex.com:3478",
  "stun:stun.connecteddata.com:3478",
  "stun:stun.cozy.org:3478",
  "stun:stun.crimeastar.net:3478",
  "stun:stun.crononauta.com:3478",
  "stun:stun.ctafauni.it:3478",
  "stun:stun.deepfinesse.com:3478",
  "stun:stun.degaronline.com:3478",
  "stun:stun.demos.su:3478",
  "stun:stun.deutscherskiverband.de:3478",
  "stun:stun.diallog.com:3478",
  "stun:stun.dls.net:3478",
  "stun:stun.dowlatow.ru:3478",
  "stun:stun.draci.info:3478",
  "stun:stun.dreifaltigkeit-stralsund.de:3478",
  "stun:stun.dukun.de:3478",
  "stun:stun.dunyatelekom.com:3478",
  "stun:stun.eaclipt.org:3478",
  "stun:stun.easter-eggs.com:3478",
  "stun:stun.edwin-wiegele.at:3478",
  "stun:stun.effexx.com:3478",
  "stun:stun.einfachcallback.de:3478",
  "stun:stun.ekir.de:3478",
  "stun:stun.eleusi.com:3478",
  "stun:stun.elitetele.com:3478",
  "stun:stun.engineeredarts.co.uk:3478",
  "stun:stun.eol.co.nz:3478",
  "stun:stun.eoni.com:3478",
  "stun:stun.eurosys.be:3478",
  "stun:stun.exoplatform.org:3478",
  "stun:stun.expandable.io:3478",
  "stun:stun.f.haeder.net:3478",
  "stun:stun.fairytel.at:3478",
  "stun:stun.fathomvoice.com:3478",
  "stun:stun.fbsbx.com:3478",
  "stun:stun.fiberpipe.net:3478",
  "stun:stun.files.fm:3478",
  "stun:stun.finsterwalder.com:3478",
  "stun:stun.fitauto.ru:3478",
  "stun:stun.fixup.net:3478",
  "stun:stun.fmo.de:3478",
  "stun:stun.foad.me.uk:3478",
  "stun:stun.fondazioneroccochinnici.it:3478",
  "stun:stun.framasoft.org:3478",
  "stun:stun.frozenmountain.com:3478",
  "stun:stun.funwithelectronics.com:3478",
  "stun:stun.futurasp.es:3478",
  "stun:stun.fwdnet.net:3478",
  "stun:stun.galeriemagnet.at:3478",
  "stun:stun.geesthacht.de:3478",
  "stun:stun.genymotion.com:3478",
  "stun:stun.geonet.ro:3478",
  "stun:stun.gigaset.net:3478",
  "stun:stun.globalmeet.com:3478",
  "stun:stun.gntel.nl:3478",
  "stun:stun.godatenow.com:3478",
  "stun:stun.goldener-internetpreis.de:3478",
  "stun:stun.goldfish.ie:3478",
  "stun:stun.graftlab.com:3478",
  "stun:stun.gravitel.ru:3478",
  "stun:stun.grazertrinkwasseringefahr.at:3478",
  "stun:stun.groenewold-newmedia.de:3478",
  "stun:stun.h4v.eu:3478",
  "stun:stun.hanacke.net:3478",
  "stun:stun.hardt-ware.de:3478",
  "stun:stun.healthtap.com:3478",
  "stun:stun.heeds.eu:3478",
  "stun:stun.hicare.net:3478",
  "stun:stun.hide.me:3478",
  "stun:stun.highfidelity.io:3478",
  "stun:stun.hinet.net:3478",
  "stun:stun.hitv.com:3478",
  "stun:stun.hot-chilli.net:3478",
  "stun:stun.ica-net.it:3478",
  "stun:stun.imafex.sk:3478",
  "stun:stun.imp.ch:3478",
  "stun:stun.innotel.com.au:3478",
  "stun:stun.interplanet.it:3478",
  "stun:stun.ippi.com:3478",
  "stun:stun.irishvoip.com:3478",
  "stun:stun.isp.net.au:3478",
  "stun:stun.issabel.org:3478",
  "stun:stun.istitutogramscisiciliano.it:3478",
  "stun:stun.ivi.at:3478",
  "stun:stun.ixc.ua:3478",
  "stun:stun.jabber.dk:3478",
  "stun:stun.jabbim.cz:3478",
  "stun:stun.jay.net:3478",
  "stun:stun.jowisoftware.de:3478",
  "stun:stun.julosoft.net:3478",
  "stun:stun.junet.se:3478",
  "stun:stun.kanojo.de:3478",
  "stun:stun.kaseya.com:3478",
  "stun:stun.katholischekirche-ruegen.de:3478",
  "stun:stun.kaznpu.kz:3478",
  "stun:stun.kedr.io:3478",
  "stun:stun.kiesler.at:3478",
  "stun:stun.kitamaebune.com:3478",
  "stun:stun.ko2100.at:3478",
  "stun:stun.komsa.de:3478",
  "stun:stun.kore.com:3478",
  "stun:stun.kostenloses-forum.com:3478",
  "stun:stun.kotter.net:3478",
  "stun:stun.kreis-bergstrasse.de:3478",
  "stun:stun.l.google.com:19305",
  "stun:stun.labs.net:3478",
  "stun:stun.ladridiricette.it:3478",
  "stun:stun.landvast.nl:3478",
  "stun:stun.le-space.de:3478",
  "stun:stun.lebendigefluesse.at:3478",
  "stun:stun.leibergmbh.de:3478",
  "stun:stun.leonde.org:3478",
  "stun:stun.lerros.com:3478",
  "stun:stun.leucotron.com.br:3478",
  "stun:stun.levigo.de:3478",
  "stun:stun.lineaencasa.com:3478",
  "stun:stun.linuxtrent.it:3478",
  "stun:stun.lleida.net:3478",
  "stun:stun.logic.ky:3478",
  "stun:stun.londonweb.net:3478",
  "stun:stun.lovense.com:3478",
  "stun:stun.m-online.net:3478",
  "stun:stun.madavi.de:3478",
  "stun:stun.magnocall.com:3478",
  "stun:stun.marble.io:3478",
  "stun:stun.marcelproust.it:3478",
  "stun:stun.medvc.eu:3478",
  "stun:stun.meetangee.com:3478",
  "stun:stun.meetwife.com:3478",
  "stun:stun.megatel.si:3478",
  "stun:stun.meowsbox.com:3478",
  "stun:stun.millenniumarts.org:3478",
  "stun:stun.mixvoip.com:3478",
  "stun:stun.mobile-italia.com:3478",
  "stun:stun.moonlight-stream.org:3478",
  "stun:stun.mot-net.com:3478",
  "stun:stun.muoversi.net:3478",
  "stun:stun.myhowto.org:3478",
  "stun:stun.myspeciality.com:3478",
  "stun:stun.myvoipapp.com:3478",
  "stun:stun.nabto.com:3478",
  "stun:stun.nanocosmos.de:3478",
  "stun:stun.nautile.nc:3478",
  "stun:stun.ncic.com:3478",
  "stun:stun.neomedia.it:3478",
  "stun:stun.net-mag.cz:3478",
  "stun:stun.newrocktech.com:3478",
  "stun:stun.next-gen.ro:3478",
  "stun:stun.nextcloud.com:3478",
  "stun:stun.nexxtmobile.de:3478",
  "stun:stun.nstelcom.com:3478",
  "stun:stun.obovsem.com:3478",
  "stun:stun.odr.de:3478",
  "stun:stun.officinabit.com:3478",
  "stun:stun.olimontel.it:3478",
  "stun:stun.oncloud7.ch:3478",
  "stun:stun.onesuite.com:3478",
  "stun:stun.onthenet.com.au:3478",
  "stun:stun.openjobs.hu:3478",
  "stun:stun.openvoip.it:3478",
  "stun:stun.optdyn.com:3478",
  "stun:stun.orszaczky.com:3478",
  "stun:stun.ortopediacoam.it:3478",
  "stun:stun.otos.pl:3478",
  "stun:stun.pados.hu:3478",
  "stun:stun.palava.tv:3478",
  "stun:stun.parcodeinebrodi.it:3478",
  "stun:stun.peeters.com:3478",
  "stun:stun.peethultra.be:3478",
  "stun:stun.penserpouragir.org:3478",
  "stun:stun.peoplefone.ch:3478",
  "stun:stun.phytter.com:3478",
  "stun:stun.piratecinema.org:3478",
  "stun:stun.piratenbrandenburg.de:3478",
  "stun:stun.planetarium.com.br:3478",
  "stun:stun.plexicomm.net:3478",
  "stun:stun.pobeda-club.ru:3478",
  "stun:stun.poetamatusel.org:3478",
  "stun:stun.provectio.fr:3478",
  "stun:stun.pruefplan.com:3478",
  "stun:stun.pure-ip.com:3478",
  "stun:stun.qcol.net:3478",
  "stun:stun.radiojar.com:3478",
  "stun:stun.redworks.nl:3478",
  "stun:stun.ringostat.com:3478",
  "stun:stun.ringvoz.com:3478",
  "stun:stun.romaaeterna.nl:3478",
  "stun:stun.romancecompass.com:3478",
  "stun:stun.root-1.de:3478",
  "stun:stun.ru-brides.com:3478",
  "stun:stun.rudtp.ru:3478",
  "stun:stun.sacko.com.au:3478",
  "stun:stun.samy.pl:3478",
  "stun:stun.savemgo.com:3478",
  "stun:stun.scalix.com:3478",
  "stun:stun.schoeffel.de:3478",
  "stun:stun.schulinformatik.at:3478",
  "stun:stun.selasky.org:3478",
  "stun:stun.senstar.com:3478",
  "stun:stun.sewan.fr:3478",
  "stun:stun.sg-slope.com:3478",
  "stun:stun.shadrinsk.net:3478",
  "stun:stun.sharpbai.com:3478",
  "stun:stun.shy.cz:3478",
  "stun:stun.siedle.com:3478",
  "stun:stun.signalwire.com:3478",
  "stun:stun.simlar.org:3478",
  "stun:stun.sipnet.com:3478",
  "stun:stun.sipthor.net:3478",
  "stun:stun.siptrunk.com:3478",
  "stun:stun.sipy.cz:3478",
  "stun:stun.sius.com:3478",
  "stun:stun.sketch.io:3478",
  "stun:stun.sky.od.ua:3478",
  "stun:stun.skydrone.aero:3478",
  "stun:stun.slackline.at:3478",
  "stun:stun.smdr.ru:3478",
  "stun:stun.smslisto.com:3478",
  "stun:stun.soho66.co.uk:3478",
  "stun:stun.solomo.de:3478",
  "stun:stun.sparvoip.de:3478",
  "stun:stun.splicecom.com:3478",
  "stun:stun.spoiltheprincess.com:3478",
  "stun:stun.spreed.me:3478",
  "stun:stun.stadtwerke-eutin.de:3478",
  "stun:stun.stbuehler.de:3478",
  "stun:stun.steinbeis-smi.de:3478",
  "stun:stun.stochastix.de:3478",
  "stun:stun.stratusvideo.com:3478",
  "stun:stun.streamix.live:3478",
  "stun:stun.streamnow.ch:3478",
  "stun:stun.studio-link.de:3478",
  "stun:stun.studio71.it:3478",
  "stun:stun.stunserver.org:3478",
  "stun:stun.surjaring.it:3478",
  "stun:stun.surrealnetworks.com:3478",
  "stun:stun.swissquote.com:3478",
  "stun:stun.swrag.de:3478",
  "stun:stun.sylaps.com:3478",
  "stun:stun.symonics.com:3478",
  "stun:stun.syncthing.net:3478",
  "stun:stun.synergiejobs.be:3478",
  "stun:stun.syrex.co.za:3478",
  "stun:stun.talkho.com:3478",
  "stun:stun.taxsee.com:3478",
  "stun:stun.teamfon.de:3478",
  "stun:stun.technosens.fr:3478",
  "stun:stun.tel2.co.uk:3478",
  "stun:stun.tele2.net:3478",
  "stun:stun.telemar.it:3478",
  "stun:stun.teliax.com:3478",
  "stun:stun.telnyx.com:3478",
  "stun:stun.telonline.com:3478",
  "stun:stun.telviva.com:3478",
  "stun:stun.textz.com:3478",
  "stun:stun.thebrassgroup.it:3478",
  "stun:stun.thinkrosystem.com:3478",
  "stun:stun.threema.ch:3478",
  "stun:stun.tichiamo.it:3478",
  "stun:stun.totalcom.info:3478",
  "stun:stun.training-online.eu:3478",
  "stun:stun.trainingspace.online:3478",
  "stun:stun.trivenet.it:3478",
  "stun:stun.ttmath.org:3478",
  "stun:stun.tula.nu:3478",
  "stun:stun.uabrides.com:3478",
  "stun:stun.uavia.eu:3478",
  "stun:stun.uiltucssicilia.it:3478",
  "stun:stun.ukh.de:3478",
  "stun:stun.url.net.au:3478",
  "stun:stun.vadacom.co.nz:3478",
  "stun:stun.var6.cn:3478",
  "stun:stun.vavadating.com:3478",
  "stun:stun.verbo.be:3478",
  "stun:stun.villapalagonia.it:3478",
  "stun:stun.vincross.com:3478",
  "stun:stun.voicetech.se:3478",
  "stun:stun.voipconnect.com:3478",
  "stun:stun.voipdiscount.com:3478",
  "stun:stun.voipgrid.nl:3478",
  "stun:stun.voipia.net:3478",
  "stun:stun.voipstreet.com:3478",
  "stun:stun.voipvoice.it:3478",
  "stun:stun.voipxs.nl:3478",
  "stun:stun.vomessen.de:3478",
  "stun:stun.vozelia.com:3478",
  "stun:stun.voztovoice.org:3478",
  "stun:stun.waterpolopalermo.it:3478",
  "stun:stun.wcoil.com:3478",
  "stun:stun.webfreak.org:3478",
  "stun:stun.webmatrix.com.br:3478",
  "stun:stun.wemag.com:3478",
  "stun:stun.westtel.ky:3478",
  "stun:stun.wia.cz:3478",
  "stun:stun.wtfismyip.com:3478",
  "stun:stun.wxnz.net:3478",
  "stun:stun.xten.com:3478",
  "stun:stun.yesdates.com:3478",
  "stun:stun.yeymo.com:3478",
  "stun:stun.yollacalls.com:3478",
  "stun:stun.yy.com:3478",
  "stun:stun.zentauron.de:3478",
  "stun:stun.zepter.ru:3478",
  "stun:stun.zottel.net:3478",
  "stun:stun1.3cx.com:3478",
  "stun:stun2.3cx.com:3478",
  "stun:stun3.3cx.com:3478",
  "stun:stun4.3cx.com:3478",
];

const turnServers = [
  // {
  //   urls: "stun:stun.relay.metered.ca:80",
  // },
  {
    urls: "turn:a.relay.metered.ca:80",
    username: "2ff716c35056d7188d97c9d7",
    credential: "pWFXhS85k+zzJmXB",
  },
  {
    urls: "turn:a.relay.metered.ca:80?transport=tcp",
    username: "2ff716c35056d7188d97c9d7",
    credential: "pWFXhS85k+zzJmXB",
  },
  {
    urls: "turn:a.relay.metered.ca:443",
    username: "2ff716c35056d7188d97c9d7",
    credential: "pWFXhS85k+zzJmXB",
  },
  {
    urls: "turn:a.relay.metered.ca:443?transport=tcp",
    username: "2ff716c35056d7188d97c9d7",
    credential: "pWFXhS85k+zzJmXB",
  },
];


async function getStunServers() {
  const candidates = []

  async function checkRTC(server){
    return new Promise(async (resolve, reject) => {
      try{
        const udpConnection = new RTCPeerConnection({
          iceServers: [{ urls: server }],
        });
        const candidate = await udpConnection.createOffer();
        candidates.push(server)
        // console.log(`${server} is active`);
        resolve(candidate)
      }catch(error){
        console.warn(`============ == == ${server} is INACTIVE`);
        console.error(error)
        reject(error)
      }
    })
  }
  const max_stun = 500 - turnServers.length

  const asyncStuns = []
  for (const server of stunServers.slice(0, max_stun)) {  
    asyncStuns.push(checkRTC(server))
  }

  await Promise.allSettled(asyncStuns)

  const newStunServers = candidates.map(s => {
    return {
      urls: s
    }
  })

  return newStunServers
}


// _testStunServers();
async function _testStunServers() {
  for (const server of stunServers.slice(0, 500)) {
    const udpConnection = new RTCPeerConnection({
      iceServers: [{ urls: server }],
    });

    try {
      const _candidates = await udpConnection.createOffer();
      console.log(
        "🚀 ~ file: meet.js:713 ~ _testStunServers ~ _candidates:",
        _candidates
      );
      udpConnection.close();
      // console.log(`${server} is active`);
      // console.log("active");
    } catch (error) {
      console.warn(`============ == == ${server} is INACTIVE`);
      console.log("🚀 ~ file: meet.js:875 ~ testStunServers ~ error:", error);
    }
  }
}

function getStunStaticServers(){
  const max_stun = 500 - turnServers.length

  return stunServers.slice(0, max_stun).map(s => {
    return {
      urls: s
    }
  })
}
async function getIceServers(){
  // const stunServers = await getStunServers()
  const stunServers = getStunStaticServers()
  return [
    ...stunServers,
    ...turnServers
  ]
}
